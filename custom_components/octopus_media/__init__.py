"""Set up the Octopus Media Card Jellyfin integration."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api.base import APIClientConfig
from .api.ha_services import HomeAssistantRadarrProvider, HomeAssistantSonarrProvider
from .api.jellyfin import JellyfinClient
from .const import (
    CONF_API_KEY,
    CONF_GROUP_EPISODES,
    CONF_INSTANCE_NAME,
    CONF_JELLYFIN_CONFIG_ENTRY_ID,
    CONF_JELLYFIN_SERVER_ID,
    CONF_JELLYFIN_USER_ID,
    CONF_PLAYING_INTERVAL,
    CONF_RADARR_CONFIG_ENTRY_ID,
    CONF_RECENT_COUNT,
    CONF_RECENT_INTERVAL,
    CONF_REF_SECRET,
    CONF_SONARR_CONFIG_ENTRY_ID,
    CONF_TIMEOUT,
    CONF_URL,
    CONF_VERIFY_SSL,
    DEFAULT_GROUP_EPISODES,
    DEFAULT_NAME,
    DEFAULT_PLAYING_INTERVAL,
    DEFAULT_RECENT_COUNT,
    DEFAULT_RECENT_INTERVAL,
    DEFAULT_TIMEOUT,
    DEFAULT_VERIFY_SSL,
)
from .coordinators.playing import JellyfinPlayingCoordinator
from .coordinators.recent import JellyfinRecentCoordinator
from .coordinators.upcoming import UpcomingCoordinator
from .device_catalog import JellyfinDeviceCatalog
from .frontend import async_register_frontend
from .http import async_register_http_views
from .image_cache import ImageMemoryCache
from .image_store import ImageReferenceStore
from .models import EntryCapabilities, build_empty_snapshot
from .runtime_data import OctopusMediaRuntimeData
from .websocket import async_register_websocket_commands

type OctopusMediaConfigEntry = ConfigEntry[OctopusMediaRuntimeData]

_LOGGER = logging.getLogger(__name__)

CONFIG_ENTRY_MINOR_VERSION = 3


async def async_setup(hass: HomeAssistant, config: dict[str, object]) -> bool:
    """Register global frontend, HTTP, and authenticated WebSocket surfaces."""
    await async_register_frontend(hass)
    async_register_http_views(hass)
    async_register_websocket_commands(hass)
    return True


async def async_migrate_entry(hass: HomeAssistant, entry: OctopusMediaConfigEntry) -> bool:
    """Add the persistent instance name to entries created before minor version 3."""
    if entry.version != 1:
        return False
    if entry.minor_version >= CONFIG_ENTRY_MINOR_VERSION:
        return True
    options = dict(entry.options)
    instance_name = str(options.get(CONF_INSTANCE_NAME, entry.title or DEFAULT_NAME)).strip()
    if not instance_name:
        instance_name = DEFAULT_NAME
    options[CONF_INSTANCE_NAME] = instance_name
    hass.config_entries.async_update_entry(
        entry,
        title=instance_name,
        options=options,
        minor_version=CONFIG_ENTRY_MINOR_VERSION,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: OctopusMediaConfigEntry) -> bool:
    """Create shared coordinators from selected Home Assistant ConfigEntries."""
    data = entry.data
    options = _synchronize_instance_name(hass, entry)
    service_config = {**data, **options}
    selected_jellyfin_id = str(data.get(CONF_JELLYFIN_CONFIG_ENTRY_ID, "")).strip()
    selected_jellyfin = hass.config_entries.async_get_entry(selected_jellyfin_id)
    if selected_jellyfin is not None and selected_jellyfin.domain == "jellyfin":
        client, user_id, server_id = JellyfinClient.from_home_assistant_entry(
            hass, selected_jellyfin
        )
    else:
        client = JellyfinClient(
            async_get_clientsession(hass),
            APIClientConfig(
                url=str(data[CONF_URL]),
                api_key=str(data[CONF_API_KEY]),
                verify_ssl=bool(data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)),
                timeout=float(data.get(CONF_TIMEOUT, DEFAULT_TIMEOUT)),
            ),
        )
        user_id = str(data[CONF_JELLYFIN_USER_ID])
        server_id = str(data[CONF_JELLYFIN_SERVER_ID])
    secret = str(data.get(CONF_REF_SECRET, entry.entry_id))
    image_store = ImageReferenceStore(
        secret,
        config_entry_id=entry.entry_id,
        server_id=server_id,
    )
    device_catalog = JellyfinDeviceCatalog(client)
    recent_interval = int(options.get(CONF_RECENT_INTERVAL, DEFAULT_RECENT_INTERVAL))
    playing_interval = int(options.get(CONF_PLAYING_INTERVAL, DEFAULT_PLAYING_INTERVAL))
    recent = JellyfinRecentCoordinator(
        hass,
        entry,
        client,
        user_id=user_id,
        secret=secret,
        image_store=image_store,
        interval=recent_interval,
        count=int(options.get(CONF_RECENT_COUNT, DEFAULT_RECENT_COUNT)),
        group_episodes=bool(options.get(CONF_GROUP_EPISODES, DEFAULT_GROUP_EPISODES)),
    )
    playing = JellyfinPlayingCoordinator(
        hass,
        entry,
        client,
        secret=secret,
        image_store=image_store,
        device_catalog=device_catalog,
        interval=playing_interval,
    )
    radarr_entry_id = str(service_config.get(CONF_RADARR_CONFIG_ENTRY_ID, "")).strip()
    radarr = HomeAssistantRadarrProvider(hass, radarr_entry_id) if radarr_entry_id else None
    sonarr_entry_id = str(service_config.get(CONF_SONARR_CONFIG_ENTRY_ID, "")).strip()
    sonarr = HomeAssistantSonarrProvider(hass, sonarr_entry_id) if sonarr_entry_id else None
    upcoming = (
        UpcomingCoordinator(
            hass,
            entry,
            radarr=radarr,
            sonarr=sonarr,
            image_store=image_store,
        )
        if radarr is not None or sonarr is not None
        else None
    )
    runtime = OctopusMediaRuntimeData(
        capabilities=EntryCapabilities(recent=True, upcoming=upcoming is not None, playing=True),
        snapshot=build_empty_snapshot(entry.entry_id, hass.config.time_zone),
        image_store=image_store,
        image_cache=ImageMemoryCache(),
        client=client,
        recent_coordinator=recent,
        playing_coordinator=playing,
        upcoming_coordinator=upcoming,
    )
    entry.runtime_data = runtime
    await asyncio.gather(
        recent.async_config_entry_first_refresh(),
        playing.async_config_entry_first_refresh(),
    )
    runtime.attach_coordinators()
    if upcoming is not None:
        await upcoming.async_request_refresh()
    _LOGGER.debug(
        "Jellyfin coordinators ready for config entry %s "
        "(recent_interval=%s seconds, playing_interval=%s seconds)",
        entry.entry_id,
        recent_interval,
        playing_interval,
    )
    return True


def _synchronize_instance_name(
    hass: HomeAssistant, entry: OctopusMediaConfigEntry
) -> dict[str, Any]:
    """Keep Home Assistant's native entry title and the public option in sync."""
    options: dict[str, Any] = dict(entry.options)
    instance_name = (
        entry.title.strip() or str(options.get(CONF_INSTANCE_NAME, DEFAULT_NAME)).strip()
    )
    if not instance_name:
        instance_name = DEFAULT_NAME
    if options.get(CONF_INSTANCE_NAME) != instance_name or entry.title != instance_name:
        options[CONF_INSTANCE_NAME] = instance_name
        hass.config_entries.async_update_entry(
            entry,
            title=instance_name,
            options=options,
        )
    return options


async def async_unload_entry(hass: HomeAssistant, entry: OctopusMediaConfigEntry) -> bool:
    """Unload coordinators, listeners, references, and refresh tasks."""
    runtime = getattr(entry, "runtime_data", None)
    if runtime is None:
        return True
    await runtime.async_close()
    _LOGGER.debug("Jellyfin coordinators unloaded for config entry %s", entry.entry_id)
    return True
