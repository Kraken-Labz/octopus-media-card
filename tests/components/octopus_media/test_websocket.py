"""Authenticated WebSocket command behavior with a fictitious runtime."""

from __future__ import annotations

from typing import Any, cast
from unittest.mock import AsyncMock, patch

from aiohttp import ClientSession
from custom_components.octopus_media.api.base import APIClientConfig
from custom_components.octopus_media.api.jellyfin import JellyfinClient
from custom_components.octopus_media.const import DOMAIN
from custom_components.octopus_media.coordinators.playing import JellyfinPlayingCoordinator
from custom_components.octopus_media.coordinators.recent import JellyfinRecentCoordinator
from custom_components.octopus_media.device_catalog import JellyfinDeviceCatalog
from custom_components.octopus_media.image_store import ImageReferenceStore
from custom_components.octopus_media.models import EntryCapabilities, build_empty_snapshot
from custom_components.octopus_media.runtime_data import OctopusMediaRuntimeData
from custom_components.octopus_media.websocket import (
    websocket_get_entries,
    websocket_get_snapshot,
    websocket_refresh,
    websocket_subscribe_snapshot,
)
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

SECRET = "fixture-reference-secret-with-enough-entropy"


class FakeConnection:
    """Collect handler output and subscription callbacks."""

    def __init__(self) -> None:
        self.results: list[tuple[int, object | None]] = []
        self.errors: list[tuple[int, str, str]] = []
        self.events: list[tuple[int, object]] = []
        self.subscriptions: dict[int, Any] = {}

    def send_result(self, msg_id: int, result: object | None = None) -> None:
        self.results.append((msg_id, result))

    def send_error(self, msg_id: int, code: str, message: str) -> None:
        self.errors.append((msg_id, code, message))

    def send_event(self, msg_id: int, event: object) -> None:
        self.events.append((msg_id, event))


def loaded_runtime(hass: HomeAssistant) -> tuple[MockConfigEntry, OctopusMediaRuntimeData]:
    client = JellyfinClient(
        cast(ClientSession, object()), APIClientConfig("https://media.invalid", "<redacted>")
    )
    store = ImageReferenceStore(SECRET)
    entry = MockConfigEntry(
        domain=DOMAIN, entry_id="fixture_entry", title="Fixture Harbor", data={}
    )
    recent = JellyfinRecentCoordinator(
        hass,
        entry,
        client,
        user_id="fixture-user",
        secret=SECRET,
        image_store=store,
        interval=180,
        count=12,
        group_episodes=True,
    )
    playing = JellyfinPlayingCoordinator(
        hass,
        entry,
        client,
        secret=SECRET,
        image_store=store,
        device_catalog=JellyfinDeviceCatalog(client),
        interval=10,
    )
    runtime = OctopusMediaRuntimeData(
        capabilities=EntryCapabilities(True, False, True),
        snapshot=build_empty_snapshot("fixture_entry", "Etc/UTC"),
        image_store=store,
        client=client,
        recent_coordinator=recent,
        playing_coordinator=playing,
    )
    entry.add_to_hass(hass)
    entry.runtime_data = runtime
    return entry, runtime


async def test_get_entries_and_snapshot_expose_no_credentials(hass: HomeAssistant) -> None:
    _, runtime = loaded_runtime(hass)
    connection = FakeConnection()
    active = cast(ActiveConnection, connection)
    websocket_get_entries(hass, active, {"id": 1, "type": "octopus_media/get_entries"})
    websocket_get_snapshot(
        hass,
        active,
        {"id": 2, "type": "octopus_media/get_snapshot", "entry_id": "fixture_entry"},
    )
    await hass.async_block_till_done()
    assert connection.results[0][1] == {
        "entries": [
            {
                "entry_id": "fixture_entry",
                "title": "Fixture Harbor",
                "capabilities": {"recent": True, "upcoming": False, "playing": True},
            }
        ]
    }
    payload = connection.results[1][1]
    assert isinstance(payload, dict)
    assert payload["upcoming"]["items"] == []
    assert payload == runtime.snapshot.as_dict()
    assert "api_key" not in str(payload)


async def test_subscribe_sends_initial_event_and_unsubscribes(hass: HomeAssistant) -> None:
    _, runtime = loaded_runtime(hass)
    connection = FakeConnection()
    websocket_subscribe_snapshot(
        hass,
        cast(ActiveConnection, connection),
        {"id": 3, "type": "octopus_media/subscribe_snapshot", "entry_id": "fixture_entry"},
    )
    await hass.async_block_till_done()
    assert connection.results == [(3, None)]
    assert len(connection.events) == 1
    assert len(runtime.listeners) == 1
    connection.subscriptions[3]()
    assert runtime.listeners == set()


async def test_refresh_delegates_only_closed_jellyfin_sections(hass: HomeAssistant) -> None:
    _, runtime = loaded_runtime(hass)
    refresh_runtime = AsyncMock(return_value=(True, None))
    connection = FakeConnection()
    with patch.object(OctopusMediaRuntimeData, "async_refresh", new=refresh_runtime):
        websocket_refresh(
            hass,
            cast(ActiveConnection, connection),
            {
                "id": 4,
                "type": "octopus_media/refresh",
                "entry_id": "fixture_entry",
                "sections": ["recent", "playing"],
            },
        )
        await hass.async_block_till_done()
    refresh_runtime.assert_awaited_once_with({"recent", "playing"})
    assert connection.results == [(4, {"accepted": True, "reason": None})]
