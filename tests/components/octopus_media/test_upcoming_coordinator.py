"""Aggregate Upcoming state tests for the two public Home Assistant providers."""

from unittest.mock import AsyncMock

from custom_components.octopus_media.api.ha_services import (
    HomeAssistantRadarrProvider,
    HomeAssistantSonarrProvider,
)
from custom_components.octopus_media.const import DOMAIN
from custom_components.octopus_media.coordinators.upcoming import UpcomingCoordinator
from custom_components.octopus_media.image_store import ImageReferenceStore
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry


def _replace_async_method(
    provider: HomeAssistantRadarrProvider | HomeAssistantSonarrProvider,
    name: str,
    mock: AsyncMock,
) -> None:
    """Install a typed async double without assigning directly to a method."""
    setattr(provider, name, mock)


def _coordinator(
    hass: HomeAssistant,
    radarr: HomeAssistantRadarrProvider,
    sonarr: HomeAssistantSonarrProvider,
) -> UpcomingCoordinator:
    return UpcomingCoordinator(
        hass,
        MockConfigEntry(domain=DOMAIN, entry_id="upcoming_entry"),
        radarr=radarr,
        sonarr=sonarr,
        image_store=ImageReferenceStore(
            "fixture-secret", config_entry_id="upcoming_entry", server_id="fixture_server"
        ),
    )


async def test_radarr_ready_and_sonarr_empty_is_ready(hass: HomeAssistant) -> None:
    radarr = HomeAssistantRadarrProvider(hass, "radarr-entry")
    sonarr = HomeAssistantSonarrProvider(hass, "sonarr-entry")
    _replace_async_method(
        radarr,
        "async_get_movies",
        AsyncMock(return_value={"Movie": {"id": 1, "title": "Movie", "monitored": True}}),
    )
    _replace_async_method(
        radarr,
        "async_get_calendar_events",
        AsyncMock(return_value=[{"summary": "Movie", "start": {"date": "2999-01-02"}}]),
    )
    _replace_async_method(sonarr, "async_get_episodes", AsyncMock(return_value=[]))

    batch = await _coordinator(hass, radarr, sonarr)._async_update_data()

    assert len(batch.items) == 1
    assert batch.partial is False


async def test_radarr_success_and_sonarr_failure_preserves_items_as_partial(
    hass: HomeAssistant,
) -> None:
    radarr = HomeAssistantRadarrProvider(hass, "radarr-entry")
    sonarr = HomeAssistantSonarrProvider(hass, "sonarr-entry")
    _replace_async_method(
        radarr,
        "async_get_movies",
        AsyncMock(return_value={"Movie": {"id": 1, "title": "Movie", "monitored": True}}),
    )
    _replace_async_method(
        radarr,
        "async_get_calendar_events",
        AsyncMock(return_value=[{"summary": "Movie", "start": {"date": "2999-01-02"}}]),
    )
    _replace_async_method(
        sonarr, "async_get_episodes", AsyncMock(side_effect=RuntimeError("fixture failure"))
    )

    batch = await _coordinator(hass, radarr, sonarr)._async_update_data()

    assert len(batch.items) == 1
    assert batch.partial is True


async def test_both_empty_sources_are_not_partial(hass: HomeAssistant) -> None:
    radarr = HomeAssistantRadarrProvider(hass, "radarr-entry")
    sonarr = HomeAssistantSonarrProvider(hass, "sonarr-entry")
    _replace_async_method(radarr, "async_get_movies", AsyncMock(return_value={}))
    _replace_async_method(radarr, "async_get_calendar_events", AsyncMock(return_value=[]))
    _replace_async_method(sonarr, "async_get_episodes", AsyncMock(return_value=[]))

    batch = await _coordinator(hass, radarr, sonarr)._async_update_data()

    assert batch.items == ()
    assert batch.partial is False
