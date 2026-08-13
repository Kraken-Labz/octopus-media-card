"""Jellyfin device catalog cache tests with entirely fictional identifiers."""

from __future__ import annotations

import asyncio
import json
from typing import cast
from unittest.mock import AsyncMock, patch

import pytest
from aiohttp import ClientSession
from custom_components.octopus_media.api.base import APIClientConfig
from custom_components.octopus_media.api.jellyfin import JellyfinClient
from custom_components.octopus_media.device_catalog import JellyfinDeviceCatalog
from custom_components.octopus_media.exceptions import (
    InvalidAuthenticationError,
    RequestTimeoutError,
)


class FakeClock:
    """Controllable monotonic clock."""

    def __init__(self) -> None:
        self.value = 1_000.0

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


def fake_client() -> JellyfinClient:
    """Build a client whose network method is replaced in every test."""
    return JellyfinClient(
        cast(ClientSession, object()),
        APIClientConfig("https://media.invalid", "<redacted>"),
    )


async def test_catalog_is_cached_per_ttl_and_manual_invalidation_reloads() -> None:
    clock = FakeClock()
    client = fake_client()
    get_devices = AsyncMock(
        side_effect=[
            [{"Id": "fixture-device-a", "CustomName": "Fixture Room"}],
            [{"Id": "fixture-device-a", "CustomName": "Expired Fixture Room"}],
            [{"Id": "fixture-device-a", "CustomName": "Updated Fixture Room"}],
        ]
    )
    catalog = JellyfinDeviceCatalog(client, clock=clock)
    with patch.object(client, "async_get_devices", new=get_devices):
        first = await catalog.async_get_for_device_ids({"fixture-device-a"})
        cached = await catalog.async_get_for_device_ids({"fixture-device-a"})
        clock.advance(301)
        expired = await catalog.async_get_for_device_ids({"fixture-device-a"})
        catalog.invalidate()
        refreshed = await catalog.async_get_for_device_ids({"fixture-device-a"})

    assert first.devices["fixture-device-a"]["CustomName"] == "Fixture Room"
    assert cached.devices["fixture-device-a"]["CustomName"] == "Fixture Room"
    assert expired.devices["fixture-device-a"]["CustomName"] == "Expired Fixture Room"
    assert refreshed.devices["fixture-device-a"]["CustomName"] == "Updated Fixture Room"
    assert get_devices.await_count == 3


async def test_unknown_device_triggers_one_catalog_refresh_without_n_plus_one() -> None:
    clock = FakeClock()
    client = fake_client()
    get_devices = AsyncMock(
        side_effect=[
            [{"Id": "fixture-device-a", "CustomName": "Room A"}],
            [
                {"Id": "fixture-device-a", "CustomName": "Room A"},
                {"Id": "fixture-device-b", "CustomName": "Room B"},
            ],
        ]
    )
    catalog = JellyfinDeviceCatalog(client, clock=clock)
    with patch.object(client, "async_get_devices", new=get_devices):
        await catalog.async_get_for_device_ids({"fixture-device-a"})
        clock.advance(1)
        found = await catalog.async_get_for_device_ids({"fixture-device-a", "fixture-device-b"})
        clock.advance(1)
        still_missing = await catalog.async_get_for_device_ids({
            "fixture-device-c",
            "fixture-device-d",
        })

    assert found.devices["fixture-device-b"]["CustomName"] == "Room B"
    assert "fixture-device-c" not in still_missing.devices
    assert get_devices.await_count == 2
    assert catalog.diagnostics()["miss_refreshes"] == 1


async def test_catalog_failure_preserves_last_valid_data_and_redacts_diagnostics() -> None:
    clock = FakeClock()
    client = fake_client()
    get_devices = AsyncMock(
        side_effect=[
            [{"Id": "private-fixture-device", "CustomName": "Private Fixture Room"}],
            RequestTimeoutError(),
        ]
    )
    catalog = JellyfinDeviceCatalog(client, clock=clock)
    with patch.object(client, "async_get_devices", new=get_devices):
        await catalog.async_get_for_device_ids({"private-fixture-device"})
        catalog.invalidate()
        stale = await catalog.async_get_for_device_ids({"private-fixture-device"})

    assert stale.stale is True
    assert stale.devices["private-fixture-device"]["CustomName"] == "Private Fixture Room"
    serialized = json.dumps(catalog.diagnostics(), sort_keys=True)
    assert "private-fixture-device" not in serialized
    assert "Private Fixture Room" not in serialized
    assert catalog.diagnostics()["last_error"] == "timeout"


async def test_initial_failure_is_throttled_and_cancellation_propagates() -> None:
    clock = FakeClock()
    client = fake_client()
    get_devices = AsyncMock(side_effect=RequestTimeoutError())
    catalog = JellyfinDeviceCatalog(client, clock=clock)
    with patch.object(client, "async_get_devices", new=get_devices):
        first = await catalog.async_get_for_device_ids({"fixture-device-a"})
        clock.advance(10)
        second = await catalog.async_get_for_device_ids({"fixture-device-a"})
    assert first.devices == {}
    assert second.devices == {}
    assert first.stale is True
    assert get_devices.await_count == 1

    cancelled = JellyfinDeviceCatalog(client, clock=clock)
    with (
        patch.object(
            client, "async_get_devices", new=AsyncMock(side_effect=asyncio.CancelledError())
        ),
        pytest.raises(asyncio.CancelledError),
    ):
        await cancelled.async_get_for_device_ids({"fixture-device-a"})


async def test_authentication_failure_is_nonfatal_and_concurrent_reads_coalesce() -> None:
    clock = FakeClock()
    client = fake_client()
    authentication_failure = JellyfinDeviceCatalog(client, clock=clock)
    with patch.object(
        client,
        "async_get_devices",
        new=AsyncMock(side_effect=InvalidAuthenticationError()),
    ):
        result = await authentication_failure.async_get_for_device_ids({"fixture-device-a"})
    assert result.devices == {}
    assert result.stale is True
    assert authentication_failure.diagnostics()["last_error"] == "auth_failed"

    coalesced = JellyfinDeviceCatalog(client, clock=clock)
    get_devices = AsyncMock(return_value=[{"Id": "fixture-device-a", "CustomName": "Fixture Room"}])
    with patch.object(client, "async_get_devices", new=get_devices):
        results = await asyncio.gather(
            coalesced.async_get_for_device_ids({"fixture-device-a"}),
            coalesced.async_get_for_device_ids({"fixture-device-a"}),
            coalesced.async_get_for_device_ids({"fixture-device-a"}),
        )
    assert all(result.devices["fixture-device-a"] for result in results)
    assert get_devices.await_count == 1
