"""Adapters for public Radarr/Sonarr Home Assistant actions."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from ..exceptions import CannotConnectError, InvalidResponseError


class HomeAssistantRadarrProvider:
    """Read Radarr movies and its calendar through public HA actions."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self.entry_id = entry_id

    async def async_get_movies(self) -> dict[str, dict[str, Any]]:
        response = await self._call("radarr", "get_movies", {})
        return _extract_mapping(response, "movies")

    async def async_get_calendar_events(self) -> list[dict[str, Any]]:
        """Read the Radarr calendar linked to this ConfigEntry."""
        entity_id = _find_calendar_entity(self._hass, self.entry_id, "radarr")
        if entity_id is None:
            raise InvalidResponseError("Radarr calendar entity is unavailable")
        now = datetime.now(UTC)
        response = await self._call(
            "calendar",
            "get_events",
            {
                "entity_id": entity_id,
                "start_date_time": now.isoformat(),
                "end_date_time": (now + timedelta(days=365)).isoformat(),
            },
        )
        return _extract_calendar_events(response, entity_id)

    async def _call(self, domain: str, service: str, data: dict[str, Any]) -> object:
        if not self._hass.services.has_service(domain, service):
            raise CannotConnectError(f"{domain}.{service} is unavailable")
        try:
            payload = {**data}
            if domain != "calendar":
                payload["entry_id"] = self.entry_id
            return await self._hass.services.async_call(
                domain,
                service,
                payload,
                blocking=True,
                return_response=True,
            )
        except Exception as err:
            raise CannotConnectError(f"{domain}.{service} failed") from err


class HomeAssistantSonarrProvider:
    """Read Sonarr upcoming episodes through the public HA action."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self.entry_id = entry_id

    async def async_get_episodes(self) -> list[dict[str, Any]]:
        if not self._hass.services.has_service("sonarr", "get_upcoming"):
            raise CannotConnectError("sonarr.get_upcoming is unavailable")
        try:
            response = await self._hass.services.async_call(
                "sonarr",
                "get_upcoming",
                {"entry_id": self.entry_id, "days": 30},
                blocking=True,
                return_response=True,
            )
        except Exception as err:
            raise CannotConnectError("sonarr.get_upcoming failed") from err
        return _extract_items(response, "episodes", mapping_values=True)


def _find_calendar_entity(hass: HomeAssistant, entry_id: str, platform: str) -> str | None:
    registry = er.async_get(hass)
    for entity in registry.entities.values():
        if (
            entity.domain == "calendar"
            and entity.platform == platform
            and entity.config_entry_id == entry_id
        ):
            return entity.entity_id
    return None


def _extract_items(
    response: object, preferred_key: str, *, mapping_values: bool = False
) -> list[dict[str, Any]]:
    """Extract public HA list or mapping envelopes without leaking raw objects."""
    value: object = response
    if isinstance(response, Mapping):
        value = response.get(preferred_key, response.get("items", response.get("data")))
    if isinstance(value, Mapping) and mapping_values:
        # Home Assistant's Sonarr action uses a title/id keyed mapping.  An
        # empty mapping is the valid "no upcoming episodes" response; a
        # non-empty mapping is normalized to a concrete list before the
        # collection check below.
        value = list(value.values())
    if not isinstance(value, (list, tuple)):
        raise InvalidResponseError("Home Assistant media action returned no item collection")
    return [dict(item) for item in value if isinstance(item, Mapping)]


def _extract_mapping(response: object, preferred_key: str) -> dict[str, dict[str, Any]]:
    """Extract the title-indexed mapping exposed by HA's Radarr action."""
    value: object = response
    if isinstance(response, Mapping):
        value = response.get(preferred_key, response.get("items", response.get("data")))
    if not isinstance(value, Mapping):
        raise InvalidResponseError("Home Assistant Radarr action returned no movie mapping")
    return {
        str(key): dict(item)
        for key, item in value.items()
        if isinstance(key, str) and isinstance(item, Mapping)
    }


def _extract_calendar_events(response: object, entity_id: str) -> list[dict[str, Any]]:
    """Accept calendar.get_events' entity-keyed or direct event envelope."""
    value: object = response
    if isinstance(response, Mapping):
        value = response.get(entity_id, response.get("events", response.get("data")))
    if isinstance(value, Mapping):
        value = value.get("events", value.get("items", value.get("data")))
    if not isinstance(value, (list, tuple)):
        raise InvalidResponseError("Home Assistant calendar returned no event list")
    return [dict(item) for item in value if isinstance(item, Mapping)]
