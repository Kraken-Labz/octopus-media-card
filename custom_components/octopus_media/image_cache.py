"""Bounded in-memory image cache with in-flight request deduplication."""

from __future__ import annotations

import asyncio
import time
from collections import OrderedDict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Final

from .exceptions import ImageNotFoundError, ImageTemporaryError

IMAGE_CACHE_TTL: Final = 30 * 60.0
IMAGE_FAILURE_TTL: Final = 2 * 60.0
IMAGE_CACHE_MAX_BYTES: Final = 32 * 1024 * 1024
IMAGE_MAX_BYTES: Final = 8 * 1024 * 1024
IMAGE_CACHE_MAX_ITEMS: Final = 256


@dataclass(frozen=True, slots=True)
class ImagePayload:
    """Validated image bytes safe to return from Home Assistant."""

    body: bytes
    content_type: str


@dataclass(slots=True)
class _CacheEntry:
    payload: ImagePayload | None
    failure: str | None
    expires_at: float

    @property
    def size(self) -> int:
        return len(self.payload.body) if self.payload is not None else 0


@dataclass(slots=True)
class _InFlight:
    task: asyncio.Task[ImagePayload]
    waiters: int = 0


class ImageMemoryCache:
    """Conservative LRU+TTL cache scoped to one ConfigEntry."""

    def __init__(
        self,
        *,
        max_bytes: int = IMAGE_CACHE_MAX_BYTES,
        max_item_bytes: int = IMAGE_MAX_BYTES,
        max_items: int = IMAGE_CACHE_MAX_ITEMS,
        positive_ttl: float = IMAGE_CACHE_TTL,
        failure_ttl: float = IMAGE_FAILURE_TTL,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_bytes = max_bytes
        self.max_item_bytes = max_item_bytes
        self.max_items = max_items
        self.positive_ttl = positive_ttl
        self.failure_ttl = failure_ttl
        self._clock = clock
        self._entries: OrderedDict[str, _CacheEntry] = OrderedDict()
        self._inflight: dict[str, _InFlight] = {}
        self._bytes = 0
        self._lock = asyncio.Lock()
        self._closed = False
        self._hits = 0
        self._misses = 0
        self._evictions = 0
        self._failures = 0
        self._last_download_duration_ms = 0

    async def async_get(
        self, key: str, fetch: Callable[[], Awaitable[ImagePayload]]
    ) -> ImagePayload:
        """Return a cached payload or share exactly one bounded fetch."""
        async with self._lock:
            if self._closed:
                raise ImageTemporaryError("image cache is closed")
            cached = self._entries.get(key)
            now = self._clock()
            if cached is not None and cached.expires_at > now:
                self._hits += 1
                self._entries.move_to_end(key)
                return self._unwrap(cached)
            if cached is not None:
                self._remove(key)
            self._misses += 1
            active = self._inflight.get(key)
            if active is None:
                task = asyncio.create_task(self._async_fetch_and_store(key, fetch))
                task.add_done_callback(self._consume_task_result)
                active = self._inflight[key] = _InFlight(task)
            active.waiters += 1
        try:
            return await asyncio.shield(active.task)
        finally:
            async with self._lock:
                active.waiters -= 1
                if active.waiters == 0:
                    self._inflight.pop(key, None)
                    if not active.task.done():
                        active.task.cancel()

    async def _async_fetch_and_store(
        self, key: str, fetch: Callable[[], Awaitable[ImagePayload]]
    ) -> ImagePayload:
        started = time.perf_counter()
        try:
            return await self._async_fetch_and_store_inner(key, fetch)
        finally:
            self._last_download_duration_ms = max(0, round((time.perf_counter() - started) * 1000))

    async def _async_fetch_and_store_inner(
        self, key: str, fetch: Callable[[], Awaitable[ImagePayload]]
    ) -> ImagePayload:
        try:
            payload = await fetch()
            if not payload.body or len(payload.body) > self.max_item_bytes:
                raise ImageTemporaryError("image violates cache item bound")
        except ImageNotFoundError:
            await self._store(key, _CacheEntry(None, "missing", self._clock() + self.failure_ttl))
            raise
        except asyncio.CancelledError:
            raise
        except Exception as err:
            await self._store(key, _CacheEntry(None, "temporary", self._clock() + self.failure_ttl))
            if isinstance(err, ImageTemporaryError):
                raise
            raise ImageTemporaryError("image fetch failed") from err
        await self._store(key, _CacheEntry(payload, None, self._clock() + self.positive_ttl))
        return payload

    async def _store(self, key: str, entry: _CacheEntry) -> None:
        async with self._lock:
            if self._closed:
                return
            if key in self._entries:
                self._remove(key)
            self._entries[key] = entry
            self._bytes += entry.size
            if entry.failure is not None:
                self._failures += 1
            while len(self._entries) > self.max_items or self._bytes > self.max_bytes:
                oldest, _ = next(iter(self._entries.items()))
                self._remove(oldest)
                self._evictions += 1

    def _remove(self, key: str) -> None:
        entry = self._entries.pop(key)
        self._bytes -= entry.size

    @staticmethod
    def _unwrap(entry: _CacheEntry) -> ImagePayload:
        if entry.failure == "missing":
            raise ImageNotFoundError("image is unavailable")
        if entry.failure is not None or entry.payload is None:
            raise ImageTemporaryError("image is temporarily unavailable")
        return entry.payload

    @staticmethod
    def _consume_task_result(task: asyncio.Task[ImagePayload]) -> None:
        if not task.cancelled():
            task.exception()

    async def async_close(self) -> None:
        """Cancel downloads and erase all binary data on unload."""
        async with self._lock:
            self._closed = True
            tasks = [active.task for active in self._inflight.values()]
            self._inflight.clear()
            self._entries.clear()
            self._bytes = 0
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    def diagnostics(self) -> dict[str, int | bool | list[str]]:
        """Return aggregate counters without refs, keys, IDs or URLs."""
        return {
            "enabled": not self._closed,
            "items": len(self._entries),
            "bytes": self._bytes,
            "limit_bytes": self.max_bytes,
            "max_item_bytes": self.max_item_bytes,
            "max_items": self.max_items,
            "hits": self._hits,
            "misses": self._misses,
            "evictions": self._evictions,
            "failures": self._failures,
            "downloads_in_progress": len(self._inflight),
            "last_download_duration_ms": self._last_download_duration_ms,
            "variants": [
                "poster-small",
                "poster-medium",
                "poster-large",
                "backdrop-small",
                "backdrop-medium",
            ],
        }
