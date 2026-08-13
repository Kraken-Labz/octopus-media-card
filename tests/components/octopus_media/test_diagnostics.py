"""Diagnostics redaction tests."""

import json
from types import SimpleNamespace
from typing import cast

from custom_components.octopus_media import OctopusMediaConfigEntry
from custom_components.octopus_media.api.jellyfin import JellyfinClient
from custom_components.octopus_media.const import CONF_INSTANCE_NAME, CONF_REF_SECRET, DOMAIN
from custom_components.octopus_media.device_catalog import JellyfinDeviceCatalog
from custom_components.octopus_media.diagnostics import async_get_config_entry_diagnostics
from custom_components.octopus_media.image_cache import ImageMemoryCache
from custom_components.octopus_media.models import EntryCapabilities, build_empty_snapshot
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_diagnostics_are_aggregate_only(hass: HomeAssistant) -> None:
    """Diagnostics expose useful counts but no backend identifiers or addresses."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Fixture Media",
        data={
            CONF_REF_SECRET: "fixture-secret-that-must-not-leak",
            "url": "https://private.example.test",
            "api_key": "<redacted>",
            "user_id": "fixture-user-id",
        },
        options={
            CONF_INSTANCE_NAME: "Fixture Media LAB",
            "recent_count": 12,
            "device_aliases": {"internal-device-id": "Private Room"},
        },
    )
    entry.add_to_hass(hass)
    entry.runtime_data = SimpleNamespace(
        capabilities=EntryCapabilities(True, False, True),
        image_cache=ImageMemoryCache(),
        playing_coordinator=SimpleNamespace(
            device_catalog=JellyfinDeviceCatalog(cast(JellyfinClient, object()))
        ),
        snapshot=build_empty_snapshot(entry.entry_id, "Etc/UTC"),
    )
    diagnostics = await async_get_config_entry_diagnostics(
        hass, cast(OctopusMediaConfigEntry, entry)
    )
    serialized = json.dumps(diagnostics, sort_keys=True)
    forbidden = {
        "fixture-secret-that-must-not-leak",
        "private.example.test",
        "<redacted>",
        "fixture-user-id",
        "internal-device-id",
        "Private Room",
    }
    assert all(value not in serialized for value in forbidden)
    assert diagnostics == {
        "domain": DOMAIN,
        "version": diagnostics["version"],
        "schema_version": 1,
        "instance_name": "Fixture Media LAB",
        "capabilities": {"recent": True, "upcoming": False, "playing": True},
        "services": {
            "jellyfin": {"state": "not_configured", "error": None},
            "radarr": {"state": "not_configured", "error": None},
            "sonarr": {"state": "not_configured", "error": None},
        },
        "polling": {"playing_interval": 10, "recent_interval": 180},
        "presentation": {
            "recent_count": 12,
            "group_episodes": True,
            "language": "auto",
            "date_format": "auto",
        },
        "image_cache": {
            "enabled": True,
            "items": 0,
            "bytes": 0,
            "limit_bytes": 32 * 1024 * 1024,
            "max_item_bytes": 8 * 1024 * 1024,
            "max_items": 256,
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "failures": 0,
            "downloads_in_progress": 0,
            "last_download_duration_ms": 0,
            "variants": [
                "poster-small",
                "poster-medium",
                "poster-large",
                "backdrop-small",
                "backdrop-medium",
            ],
        },
        "device_catalog": {
            "enabled": True,
            "supported": None,
            "ttl_seconds": 300,
            "items": 0,
            "matches": 0,
            "missing": 0,
            "cache_valid": False,
            "stale": False,
            "age_seconds": None,
            "last_error": None,
            "requests": 0,
            "hits": 0,
            "miss_refreshes": 0,
        },
        "snapshot": {
            "revision": 0,
            "counts": {"recent": 0, "upcoming": 0, "playing": 0},
            "sections": {
                "recent": {"stale": False, "partial": False},
                "upcoming": {"stale": False, "partial": False},
                "playing": {"stale": False, "partial": False},
            },
        },
    }
