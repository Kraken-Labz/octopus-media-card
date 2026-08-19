"""Config, reconfigure, and options flow tests using existing ConfigEntries."""

from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.octopus_media.const import (
    CONF_GROUP_EPISODES,
    CONF_INSTANCE_NAME,
    CONF_JELLYFIN_CONFIG_ENTRY_ID,
    CONF_RADARR_CONFIG_ENTRY_ID,
    CONF_SONARR_CONFIG_ENTRY_ID,
    DEFAULT_NAME,
    DOMAIN,
)
from custom_components.octopus_media.normalizers import NormalizedBatch
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry


def _sources(
    hass: HomeAssistant,
    *,
    radarr: bool = False,
    sonarr: bool = False,
) -> dict[str, MockConfigEntry]:
    entries = {
        "jellyfin": MockConfigEntry(
            domain="jellyfin", title="Fixture Jellyfin", state=ConfigEntryState.LOADED
        ),
    }
    if radarr:
        entries["radarr"] = MockConfigEntry(
            domain="radarr", title="Fixture Radarr", state=ConfigEntryState.LOADED
        )
    if sonarr:
        entries["sonarr"] = MockConfigEntry(
            domain="sonarr", title="Fixture Sonarr", state=ConfigEntryState.LOADED
        )
    for entry in entries.values():
        entry.add_to_hass(hass)
    return entries


async def _configure(
    hass: HomeAssistant,
    entries: dict[str, MockConfigEntry],
    *,
    name: str = DEFAULT_NAME,
) -> Any:
    data: dict[str, str] = {
        CONF_INSTANCE_NAME: name,
        CONF_JELLYFIN_CONFIG_ENTRY_ID: entries["jellyfin"].entry_id,
    }
    for domain in ("radarr", "sonarr"):
        if domain in entries:
            data[f"{domain}_config_entry_id"] = entries[domain].entry_id
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_USER},
    )
    assert result["type"] is FlowResultType.FORM
    with patch(
        "custom_components.octopus_media.async_setup_entry", new=AsyncMock(return_value=True)
    ):
        return await hass.config_entries.flow.async_configure(result["flow_id"], data)


async def test_install_with_each_provider_combination(hass: HomeAssistant) -> None:
    for radarr, sonarr in ((False, False), (True, False), (False, True), (True, True)):
        entries = _sources(hass, radarr=radarr, sonarr=sonarr)
        result = await _configure(hass, entries)
        assert result["type"] is FlowResultType.CREATE_ENTRY
        assert result["title"] == DEFAULT_NAME
        data = result["data"]
        assert data[CONF_JELLYFIN_CONFIG_ENTRY_ID] == entries["jellyfin"].entry_id
        assert data.get(CONF_RADARR_CONFIG_ENTRY_ID) == (
            entries["radarr"].entry_id if radarr else None
        )
        assert data.get(CONF_SONARR_CONFIG_ENTRY_ID) == (
            entries["sonarr"].entry_id if sonarr else None
        )


async def test_install_uses_custom_entry_name(hass: HomeAssistant) -> None:
    entries = _sources(hass)
    result = await _configure(hass, entries, name="Sala de mídia")
    assert result["title"] == "Sala de mídia"


async def test_install_without_jellyfin_is_explained(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_USER},
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "jellyfin_not_configured"


async def test_reconfigure_changes_name_and_providers(hass: HomeAssistant) -> None:
    old = _sources(hass)
    new = _sources(hass, radarr=True, sonarr=True)
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Octopus Media",
        data={CONF_JELLYFIN_CONFIG_ENTRY_ID: old["jellyfin"].entry_id},
        options={CONF_GROUP_EPISODES: True},
    )
    entry.add_to_hass(hass)
    entry_id_before = entry.entry_id
    octopus_ids_before = [item.entry_id for item in hass.config_entries.async_entries(DOMAIN)]
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_RECONFIGURE, "entry_id": entry.entry_id},
    )
    assert result["step_id"] == "reconfigure"
    setup_entry = AsyncMock(return_value=True)
    with patch("custom_components.octopus_media.async_setup_entry", new=setup_entry):
        completed = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {
                CONF_INSTANCE_NAME: "Octopus Media Test",
                CONF_JELLYFIN_CONFIG_ENTRY_ID: new["jellyfin"].entry_id,
                CONF_RADARR_CONFIG_ENTRY_ID: new["radarr"].entry_id,
                CONF_SONARR_CONFIG_ENTRY_ID: new["sonarr"].entry_id,
            },
        )
    assert completed["type"] is FlowResultType.ABORT
    assert completed["reason"] == "reconfigure_successful"
    assert entry.entry_id == entry_id_before
    assert [
        item.entry_id for item in hass.config_entries.async_entries(DOMAIN)
    ] == octopus_ids_before
    assert entry.title == "Octopus Media Test"
    assert entry.data[CONF_RADARR_CONFIG_ENTRY_ID] == new["radarr"].entry_id
    assert entry.data[CONF_SONARR_CONFIG_ENTRY_ID] == new["sonarr"].entry_id
    assert entry.state is ConfigEntryState.LOADED
    setup_entry.assert_awaited()


async def test_options_flow_only_exposes_grouping(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title=DEFAULT_NAME,
        data={CONF_JELLYFIN_CONFIG_ENTRY_ID: "jellyfin-entry"},
        options={CONF_GROUP_EPISODES: True, "recent_interval": 180},
    )
    with patch(
        "custom_components.octopus_media.async_setup_entry", new=AsyncMock(return_value=True)
    ):
        entry.add_to_hass(hass)
        result = await hass.config_entries.options.async_init(entry.entry_id)
        assert result["type"] is FlowResultType.FORM
        data_schema = cast(Any, result["data_schema"])
        assert set(data_schema.schema) == {CONF_GROUP_EPISODES}
        completed = await hass.config_entries.options.async_configure(
            result["flow_id"], {CONF_GROUP_EPISODES: False}
        )
    assert completed["type"] is FlowResultType.CREATE_ENTRY
    assert completed["data"][CONF_GROUP_EPISODES] is False
    assert completed["data"]["recent_interval"] == 180


async def test_setup_entry_constructs_client_from_selected_jellyfin_entry(
    hass: HomeAssistant,
) -> None:
    """The real setup path resolves the selected Jellyfin ConfigEntry factory."""
    jellyfin = MockConfigEntry(
        domain="jellyfin",
        title="Kraken",
        state=ConfigEntryState.LOADED,
        data={"url": "http://jellyfin.invalid"},
    )
    jellyfin.runtime_data = SimpleNamespace(
        api_client=SimpleNamespace(config=SimpleNamespace(data={"auth.token": "fixture-token"})),
        user_id="fixture-user",
        server_id="fixture-server",
    )
    jellyfin.add_to_hass(hass)
    octopus = MockConfigEntry(
        domain=DOMAIN,
        title=DEFAULT_NAME,
        data={CONF_JELLYFIN_CONFIG_ENTRY_ID: jellyfin.entry_id},
        options={CONF_INSTANCE_NAME: DEFAULT_NAME, CONF_GROUP_EPISODES: True},
    )
    coordinator = MagicMock()
    coordinator.data = NormalizedBatch((), False)
    coordinator.last_update_success = True
    coordinator.last_exception = None
    coordinator.async_config_entry_first_refresh = AsyncMock()
    coordinator.async_shutdown = AsyncMock()
    coordinator.async_request_refresh = AsyncMock()
    coordinator.async_add_listener.return_value = lambda: None
    playing = MagicMock()
    playing.data = NormalizedBatch((), False)
    playing.last_update_success = True
    playing.last_exception = None
    playing.async_config_entry_first_refresh = AsyncMock()
    playing.async_shutdown = AsyncMock()
    playing.async_request_refresh = AsyncMock()
    playing.async_add_listener.return_value = lambda: None

    from custom_components.octopus_media import async_setup_entry, async_unload_entry

    with (
        patch(
            "custom_components.octopus_media.JellyfinRecentCoordinator", return_value=coordinator
        ),
        patch("custom_components.octopus_media.JellyfinPlayingCoordinator", return_value=playing),
    ):
        assert await async_setup_entry(hass, octopus) is True
        assert octopus.runtime_data.client._config.api_key == "fixture-token"
        assert octopus.runtime_data.recent_coordinator is coordinator
        await async_unload_entry(hass, octopus)
