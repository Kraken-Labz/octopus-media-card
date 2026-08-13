"""Bounded image cache behavior with entirely fictional payloads."""

import asyncio

import pytest
from custom_components.octopus_media.exceptions import ImageNotFoundError, ImageTemporaryError
from custom_components.octopus_media.image_cache import ImageMemoryCache, ImagePayload


async def test_cache_hit_miss_ttl_and_lru_eviction() -> None:
    now = [10.0]
    cache = ImageMemoryCache(
        max_bytes=8,
        max_item_bytes=8,
        max_items=2,
        positive_ttl=5,
        clock=lambda: now[0],
    )
    calls = 0

    async def fetch(value: bytes) -> ImagePayload:
        nonlocal calls
        calls += 1
        return ImagePayload(value, "image/png")

    assert (await cache.async_get("a", lambda: fetch(b"aaa"))).body == b"aaa"
    assert (await cache.async_get("a", lambda: fetch(b"xxx"))).body == b"aaa"
    await cache.async_get("b", lambda: fetch(b"bbb"))
    await cache.async_get("c", lambda: fetch(b"ccc"))
    assert cache.diagnostics()["items"] == 2
    assert cache.diagnostics()["evictions"] == 1
    now[0] += 6
    assert (await cache.async_get("a", lambda: fetch(b"new"))).body == b"new"
    assert calls == 4


async def test_inflight_is_deduplicated_and_survives_one_waiter_cancellation() -> None:
    cache = ImageMemoryCache()
    started = asyncio.Event()
    release = asyncio.Event()
    calls = 0

    async def fetch() -> ImagePayload:
        nonlocal calls
        calls += 1
        started.set()
        await release.wait()
        return ImagePayload(b"shared", "image/jpeg")

    first = asyncio.create_task(cache.async_get("same", fetch))
    second = asyncio.create_task(cache.async_get("same", fetch))
    await started.wait()
    first.cancel()
    with pytest.raises(asyncio.CancelledError):
        await first
    release.set()
    assert (await second).body == b"shared"
    assert calls == 1


async def test_negative_ttl_and_unload_clear_binary_state() -> None:
    cache = ImageMemoryCache(failure_ttl=60)
    calls = 0

    async def missing() -> ImagePayload:
        nonlocal calls
        calls += 1
        raise ImageNotFoundError

    with pytest.raises(ImageNotFoundError):
        await cache.async_get("missing", missing)
    with pytest.raises(ImageNotFoundError):
        await cache.async_get("missing", missing)
    assert calls == 1
    await cache.async_close()
    assert cache.diagnostics()["items"] == 0
    assert cache.diagnostics()["bytes"] == 0
    assert cache.diagnostics()["enabled"] is False


async def test_total_byte_limit_and_last_waiter_cancellation() -> None:
    cache = ImageMemoryCache(max_bytes=5, max_item_bytes=5, max_items=10)
    await cache.async_get("first", lambda: _payload(b"111"))
    await cache.async_get("second", lambda: _payload(b"222"))
    assert cache.diagnostics()["bytes"] == 3
    assert cache.diagnostics()["evictions"] == 1

    cancelled = asyncio.Event()

    async def waiting() -> ImagePayload:
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()
        raise AssertionError("unreachable")

    only_waiter = asyncio.create_task(cache.async_get("waiting", waiting))
    await asyncio.sleep(0)
    only_waiter.cancel()
    with pytest.raises(asyncio.CancelledError):
        await only_waiter
    await asyncio.wait_for(cancelled.wait(), timeout=1)
    assert cache.diagnostics()["downloads_in_progress"] == 0


async def _payload(body: bytes) -> ImagePayload:
    return ImagePayload(body, "image/jpeg")


async def test_temporary_failure_is_cached_and_closed_cache_fails() -> None:
    cache = ImageMemoryCache()
    calls = 0

    async def broken() -> ImagePayload:
        nonlocal calls
        calls += 1
        raise RuntimeError("fixture failure")

    with pytest.raises(ImageTemporaryError):
        await cache.async_get("broken", broken)
    with pytest.raises(ImageTemporaryError):
        await cache.async_get("broken", broken)
    assert calls == 1
    await cache.async_close()
    with pytest.raises(ImageTemporaryError):
        await cache.async_get("closed", lambda: _payload(b"unused"))
