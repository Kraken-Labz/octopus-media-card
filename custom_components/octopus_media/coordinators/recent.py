"""Shared Jellyfin recent-media coordinator."""

import logging
from time import monotonic

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..api.jellyfin import JellyfinClient
from ..image_store import ImageReferenceStore
from ..models import RecentItem
from ..normalizers import NormalizedBatch, normalize_recent_items
from .base import JellyfinCoordinator

_LOGGER = logging.getLogger(__name__)


class JellyfinRecentCoordinator(JellyfinCoordinator[RecentItem]):
    """Poll and normalize recent items once per ConfigEntry."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        client: JellyfinClient,
        *,
        user_id: str,
        secret: str,
        image_store: ImageReferenceStore,
        interval: int,
        count: int,
        group_episodes: bool,
    ) -> None:
        super().__init__(hass, config_entry, "octopus_media_jellyfin_recent", interval)
        self._client = client
        self._user_id = user_id
        self._secret = secret
        self._image_store = image_store
        self._count = count
        self._group_episodes = group_episodes

    async def _async_update_data(self) -> NormalizedBatch[RecentItem]:
        """Fetch ungrouped DTOs and apply deterministic local normalization."""
        started = monotonic()
        try:
            raw = await self._client.async_get_recent_items(
                self._user_id,
                limit=min(200, self._count * 4 if self._group_episodes else self._count),
            )
        except Exception as err:
            raise self.update_failed(err) from err
        normalized = normalize_recent_items(
            raw,
            secret=self._secret,
            image_store=self._image_store,
            group_episodes=self._group_episodes,
            limit=self._count,
        )
        _LOGGER.debug(
            "Jellyfin recent update completed (duration_ms=%s, normalized_items=%s)",
            round((monotonic() - started) * 1000),
            len(normalized.items),
        )
        return normalized
