"""Shared Jellyfin active-session coordinator."""

import logging
from time import monotonic

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..api.jellyfin import JellyfinClient
from ..device_catalog import JellyfinDeviceCatalog
from ..image_store import ImageReferenceStore
from ..models import PlayingItem
from ..normalizers import NormalizedBatch, normalize_sessions
from .base import JellyfinCoordinator

_LOGGER = logging.getLogger(__name__)


class JellyfinPlayingCoordinator(JellyfinCoordinator[PlayingItem]):
    """Poll and normalize playing/paused sessions once per ConfigEntry."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        client: JellyfinClient,
        *,
        secret: str,
        image_store: ImageReferenceStore,
        device_catalog: JellyfinDeviceCatalog,
        interval: int,
    ) -> None:
        super().__init__(hass, config_entry, "octopus_media_jellyfin_playing", interval)
        self._client = client
        self._secret = secret
        self._image_store = image_store
        self.device_catalog = device_catalog

    async def _async_update_data(self) -> NormalizedBatch[PlayingItem]:
        """Fetch sessions and discard idle/unsupported DTOs in normalization."""
        started = monotonic()
        try:
            raw = await self._client.async_get_sessions()
        except Exception as err:
            raise self.update_failed(err) from err
        device_ids = {
            value.strip()
            for session in raw
            if isinstance((value := session.get("DeviceId")), str) and value.strip()
        }
        catalog = await self.device_catalog.async_get_for_device_ids(device_ids)
        normalized = normalize_sessions(
            raw,
            secret=self._secret,
            image_store=self._image_store,
            devices=dict(catalog.devices),
        )
        if catalog.stale and not normalized.partial:
            normalized = NormalizedBatch(normalized.items, partial=True)
        _LOGGER.debug(
            "Jellyfin playing update completed (duration_ms=%s, normalized_items=%s)",
            round((monotonic() - started) * 1000),
            len(normalized.items),
        )
        return normalized
