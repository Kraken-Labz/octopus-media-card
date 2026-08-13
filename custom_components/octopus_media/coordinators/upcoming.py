"""Shared Radarr/Sonarr Upcoming coordinator."""

from __future__ import annotations

import logging
from datetime import timedelta
from zoneinfo import ZoneInfo

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..api.ha_services import HomeAssistantRadarrProvider, HomeAssistantSonarrProvider
from ..const import DEFAULT_UPCOMING_COUNT, DEFAULT_UPCOMING_INTERVAL
from ..image_store import ImageReferenceStore
from ..models import UpcomingItem
from ..normalizers import NormalizedBatch, merge_upcoming, normalize_radarr, normalize_sonarr

_LOGGER = logging.getLogger(__name__)


class UpcomingCoordinator(DataUpdateCoordinator[NormalizedBatch[UpcomingItem]]):
    """Poll both services once, preserving partial source success."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        *,
        radarr: HomeAssistantRadarrProvider | None,
        sonarr: HomeAssistantSonarrProvider | None,
        image_store: ImageReferenceStore,
        interval: int = DEFAULT_UPCOMING_INTERVAL,
        count: int = DEFAULT_UPCOMING_COUNT,
    ) -> None:
        super().__init__(
            hass,
            logger=_LOGGER,
            config_entry=config_entry,
            name="octopus_media_upcoming",
            update_interval=timedelta(seconds=interval),
        )
        self.radarr = radarr
        self.sonarr = sonarr
        self.image_store = image_store
        self.count = max(1, min(count, 20))
        self.service_errors: dict[str, str | None] = {"radarr": None, "sonarr": None}
        self.service_success: dict[str, bool] = {
            "radarr": radarr is not None,
            "sonarr": sonarr is not None,
        }

    async def _async_update_data(self) -> NormalizedBatch[UpcomingItem]:
        """Fetch available sources without allowing one failure to erase the other."""
        batches: list[NormalizedBatch[UpcomingItem]] = []
        configured = sum(client is not None for client in (self.radarr, self.sonarr))
        for name, client in (
            ("radarr", self.radarr),
            ("sonarr", self.sonarr),
        ):
            if client is None:
                self.service_success[name] = False
                self.service_errors[name] = "not_configured"
                continue
            try:
                if name == "radarr":
                    assert isinstance(client, HomeAssistantRadarrProvider)
                    raw_movies = await client.async_get_movies()
                    calendar_events = await client.async_get_calendar_events()
                    batch = normalize_radarr(
                        raw_movies,
                        calendar_events=calendar_events,
                        timezone=ZoneInfo(self.hass.config.time_zone),
                        image_store=self.image_store,
                    )
                else:
                    assert isinstance(client, HomeAssistantSonarrProvider)
                    raw_episodes = await client.async_get_episodes()
                    batch = normalize_sonarr(
                        raw_episodes,
                        timezone=ZoneInfo(self.hass.config.time_zone),
                        image_store=self.image_store,
                    )
            except Exception as err:
                self.service_success[name] = False
                self.service_errors[name] = _safe_error(err)
                _LOGGER.warning("Upcoming %s update failed: %s", name, self.service_errors[name])
                continue
            self.service_success[name] = True
            self.service_errors[name] = None
            batches.append(batch)

        if not batches:
            raise UpdateFailed("unavailable")
        if len(batches) == 1:
            merged = batches[0]
            partial = merged.partial or configured == 2
        else:
            merged = merge_upcoming(batches[0], batches[1], limit=self.count)
            partial = merged.partial
        return NormalizedBatch(merged.items[: self.count], partial)


def _safe_error(error: Exception) -> str:
    """Return a closed, non-sensitive source error."""
    name = error.__class__.__name__
    return {
        "InvalidAuthenticationError": "auth_failed",
        "RequestTimeoutError": "timeout",
        "CannotConnectError": "unreachable",
        "InvalidResponseError": "invalid_response",
        "UnexpectedHTTPError": "unexpected_http",
    }.get(name, "unknown")
