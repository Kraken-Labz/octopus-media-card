"""Aggregate diagnostics without Jellyfin identifiers or credentials."""

from typing import Any

from homeassistant.core import HomeAssistant

from . import OctopusMediaConfigEntry
from .const import (
    CONF_DATE_FORMAT,
    CONF_GROUP_EPISODES,
    CONF_INSTANCE_NAME,
    CONF_LANGUAGE,
    CONF_PLAYING_INTERVAL,
    CONF_RECENT_COUNT,
    CONF_RECENT_INTERVAL,
    DEFAULT_DATE_FORMAT,
    DEFAULT_GROUP_EPISODES,
    DEFAULT_LANGUAGE,
    DEFAULT_NAME,
    DEFAULT_PLAYING_INTERVAL,
    DEFAULT_RECENT_COUNT,
    DEFAULT_RECENT_INTERVAL,
    DOMAIN,
    VERSION,
)


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: OctopusMediaConfigEntry
) -> dict[str, Any]:
    """Return only aggregate state and non-sensitive runtime configuration."""
    snapshot = entry.runtime_data.snapshot
    options = entry.options
    return {
        "domain": DOMAIN,
        "version": VERSION,
        "schema_version": snapshot.schema_version,
        "instance_name": str(options.get(CONF_INSTANCE_NAME, entry.title or DEFAULT_NAME)),
        "capabilities": entry.runtime_data.capabilities.as_dict(),
        "services": {
            source.value: {
                "state": availability.state.value,
                "error": availability.error,
            }
            for source, availability in snapshot.availability.items()
        },
        "polling": {
            "playing_interval": int(options.get(CONF_PLAYING_INTERVAL, DEFAULT_PLAYING_INTERVAL)),
            "recent_interval": int(options.get(CONF_RECENT_INTERVAL, DEFAULT_RECENT_INTERVAL)),
        },
        "presentation": {
            "recent_count": int(options.get(CONF_RECENT_COUNT, DEFAULT_RECENT_COUNT)),
            "group_episodes": bool(options.get(CONF_GROUP_EPISODES, DEFAULT_GROUP_EPISODES)),
            "language": str(options.get(CONF_LANGUAGE, DEFAULT_LANGUAGE)),
            "date_format": str(options.get(CONF_DATE_FORMAT, DEFAULT_DATE_FORMAT)),
        },
        "image_cache": entry.runtime_data.image_cache.diagnostics(),
        "device_catalog": entry.runtime_data.playing_coordinator.device_catalog.diagnostics(),
        "snapshot": {
            "revision": snapshot.revision,
            "counts": {
                "recent": len(snapshot.recent.items),
                "upcoming": len(snapshot.upcoming.items),
                "playing": len(snapshot.playing.items),
            },
            "sections": {
                "recent": {
                    "stale": snapshot.recent.stale,
                    "partial": snapshot.recent.partial,
                },
                "upcoming": {
                    "stale": snapshot.upcoming.stale,
                    "partial": snapshot.upcoming.partial,
                },
                "playing": {
                    "stale": snapshot.playing.stale,
                    "partial": snapshot.playing.partial,
                },
            },
        },
    }
