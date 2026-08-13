"""Shared coordinator, snapshot, stale, refresh, and unload tests."""

from __future__ import annotations

import logging
from typing import cast
from unittest.mock import AsyncMock, Mock, patch

from aiohttp import ClientSession
from custom_components.octopus_media.api.base import APIClientConfig
from custom_components.octopus_media.api.jellyfin import JellyfinClient
from custom_components.octopus_media.api.jellyfin_types import JellyfinMediaItem
from custom_components.octopus_media.const import (
    CONF_API_KEY,
    CONF_JELLYFIN_SERVER_ID,
    CONF_JELLYFIN_USER_ID,
    CONF_REF_SECRET,
    CONF_TIMEOUT,
    CONF_URL,
    CONF_VERIFY_SSL,
    DOMAIN,
)
from custom_components.octopus_media.coordinators.playing import JellyfinPlayingCoordinator
from custom_components.octopus_media.coordinators.recent import JellyfinRecentCoordinator
from custom_components.octopus_media.device_catalog import JellyfinDeviceCatalog
from custom_components.octopus_media.exceptions import (
    InvalidAuthenticationError,
    RequestTimeoutError,
)
from custom_components.octopus_media.image_store import ImageReferenceStore
from custom_components.octopus_media.models import (
    AvailabilityState,
    DashboardSnapshot,
    EntryCapabilities,
    MediaSource,
    RecentItem,
    build_empty_snapshot,
)
from custom_components.octopus_media.normalizers import NormalizedBatch, normalize_recent_items
from custom_components.octopus_media.runtime_data import OctopusMediaRuntimeData
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import UpdateFailed
from pytest import LogCaptureFixture
from pytest_homeassistant_custom_component.common import MockConfigEntry

from tests.fixtures.jellyfin import MOVIE, playing_session

SECRET = "fixture-reference-secret-with-enough-entropy"


def fake_client() -> JellyfinClient:
    return JellyfinClient(
        cast(ClientSession, object()),
        APIClientConfig("https://media.invalid", "<redacted>"),
    )


def coordinators(
    hass: HomeAssistant, client: JellyfinClient
) -> tuple[JellyfinRecentCoordinator, JellyfinPlayingCoordinator, ImageReferenceStore]:
    store = ImageReferenceStore(SECRET)
    entry = MockConfigEntry(domain=DOMAIN, data={})
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
    return recent, playing, store


async def test_coordinators_fetch_and_normalize_fictional_data(hass: HomeAssistant) -> None:
    client = fake_client()
    with (
        patch.object(client, "async_get_recent_items", new=AsyncMock(return_value=[MOVIE])),
        patch.object(client, "async_get_sessions", new=AsyncMock(return_value=[playing_session()])),
        patch.object(
            client,
            "async_get_devices",
            new=AsyncMock(
                return_value=[
                    {
                        "Id": "fixture-device-a",
                        "Name": "Test Display A",
                        "CustomName": "Fixture Room",
                    }
                ]
            ),
        ),
    ):
        recent, playing, _ = coordinators(hass, client)
        assert (await recent._async_update_data()).items[0].title == "The Clockwork Island"
        playing_item = (await playing._async_update_data()).items[0]
        assert playing_item.progress > 13
        assert playing_item.device_name == "Fixture Room"


async def test_coordinator_wraps_timeout_in_safe_update_failed(hass: HomeAssistant) -> None:
    client = fake_client()
    with patch.object(
        client, "async_get_recent_items", new=AsyncMock(side_effect=RequestTimeoutError())
    ):
        recent, _, _ = coordinators(hass, client)
        try:
            await recent._async_update_data()
        except UpdateFailed as error:
            assert str(error) == "timeout"
        else:
            raise AssertionError("Expected safe UpdateFailed")


async def test_coordinator_triggers_safe_config_entry_reauthentication(
    hass: HomeAssistant,
) -> None:
    client = fake_client()
    with patch.object(
        client,
        "async_get_sessions",
        new=AsyncMock(side_effect=InvalidAuthenticationError()),
    ):
        _, playing, _ = coordinators(hass, client)
        try:
            await playing._async_update_data()
        except ConfigEntryAuthFailed as error:
            assert str(error) == "auth_failed"
        else:
            raise AssertionError("Expected Home Assistant reauthentication trigger")


async def test_runtime_preserves_last_valid_data_marks_stale_and_deduplicates(
    hass: HomeAssistant,
) -> None:
    client = fake_client()
    recent, playing, store = coordinators(hass, client)
    recent_item = _recent_batch(store).items
    recent.async_set_updated_data(NormalizedBatch(recent_item))
    playing.async_set_updated_data(NormalizedBatch(()))
    runtime = OctopusMediaRuntimeData(
        capabilities=EntryCapabilities(True, False, True),
        snapshot=build_empty_snapshot("fixture_entry", "America/Sao_Paulo"),
        image_store=store,
        client=client,
        recent_coordinator=recent,
        playing_coordinator=playing,
    )
    snapshots: list[DashboardSnapshot] = []
    runtime.subscribe(snapshots.append)
    runtime.attach_coordinators()
    assert runtime.snapshot.recent.items == recent_item
    assert runtime.snapshot.availability[MediaSource.JELLYFIN].state is AvailabilityState.ONLINE
    first_revision = runtime.snapshot.revision
    runtime.reconcile_snapshot()
    assert runtime.snapshot.revision == first_revision
    assert len(snapshots) == 1

    recent.async_set_update_error(UpdateFailed("timeout"))
    assert runtime.snapshot.recent.items == recent_item
    assert runtime.snapshot.recent.stale is True
    assert runtime.snapshot.availability[MediaSource.JELLYFIN].error == "timeout"


def _recent_batch(store: ImageReferenceStore) -> NormalizedBatch[RecentItem]:
    return normalize_recent_items(
        cast(list[JellyfinMediaItem], [MOVIE]),
        secret=SECRET,
        image_store=store,
        group_episodes=False,
        limit=12,
    )


async def test_runtime_refresh_rate_limit_and_closed_state(hass: HomeAssistant) -> None:
    client = fake_client()
    recent, playing, store = coordinators(hass, client)
    recent_refresh = AsyncMock()
    playing_refresh = AsyncMock()
    recent_shutdown = AsyncMock()
    playing_shutdown = AsyncMock()
    catalog_invalidate = Mock()
    runtime = OctopusMediaRuntimeData(
        capabilities=EntryCapabilities(True, False, True),
        snapshot=build_empty_snapshot("fixture_entry", "Etc/UTC"),
        image_store=store,
        client=client,
        recent_coordinator=recent,
        playing_coordinator=playing,
    )
    with (
        patch.object(recent, "async_request_refresh", new=recent_refresh),
        patch.object(playing, "async_request_refresh", new=playing_refresh),
        patch.object(recent, "async_shutdown", new=recent_shutdown),
        patch.object(playing, "async_shutdown", new=playing_shutdown),
        patch.object(playing.device_catalog, "invalidate", new=catalog_invalidate),
    ):
        assert await runtime.async_refresh({"all"}) == (True, None)
        assert await runtime.async_refresh({"recent"}) == (False, "rate_limited")
        recent_refresh.assert_awaited_once()
        playing_refresh.assert_awaited_once()
        catalog_invalidate.assert_called_once_with()
        await runtime.async_close()
    assert runtime.closed is True
    assert runtime.snapshot.availability[MediaSource.JELLYFIN].error == "closed"
    assert await runtime.async_refresh({"all"}) == (False, "closed")


async def test_setup_capabilities_polling_and_unload(
    hass: HomeAssistant, caplog: LogCaptureFixture
) -> None:
    caplog.set_level(logging.DEBUG, logger="custom_components.octopus_media")
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Fixture Harbor",
        data={
            CONF_URL: "https://media.invalid",
            CONF_API_KEY: "fixture-api-key-never-log",
            CONF_VERIFY_SSL: True,
            CONF_TIMEOUT: 10,
            CONF_JELLYFIN_SERVER_ID: "fixture-server",
            CONF_JELLYFIN_USER_ID: "fixture-user",
            CONF_REF_SECRET: SECRET,
        },
    )
    entry.add_to_hass(hass)
    with (
        patch.object(JellyfinClient, "async_get_recent_items", new=AsyncMock(return_value=[])),
        patch.object(JellyfinClient, "async_get_sessions", new=AsyncMock(return_value=[])),
        patch.object(JellyfinClient, "async_get_devices", new=AsyncMock(return_value=[])),
    ):
        assert await hass.config_entries.async_setup(entry.entry_id)
    assert entry.runtime_data.capabilities.as_dict() == {
        "recent": True,
        "upcoming": False,
        "playing": True,
    }
    runtime = entry.runtime_data
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert runtime.closed is True
    assert not hasattr(entry, "runtime_data")
    messages = "\n".join(record.getMessage() for record in caplog.records)
    assert "Jellyfin recent update completed" in messages
    assert "Jellyfin playing update completed" in messages
    assert "Jellyfin coordinators ready" in messages
    assert "Jellyfin coordinators unloaded" in messages
    assert "fixture-api-key-never-log" not in messages
    assert "https://media.invalid" not in messages
    assert "fixture-user" not in messages
    assert SECRET not in messages
