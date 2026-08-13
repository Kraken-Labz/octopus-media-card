"""Config, reauth, duplicate, and options flow tests with fictitious DTOs."""

from unittest.mock import AsyncMock, patch

from custom_components.octopus_media.const import (
    CONF_API_KEY,
    CONF_DEVICE_ALIASES,
    CONF_INSTANCE_NAME,
    CONF_JELLYFIN_SERVER_ID,
    CONF_JELLYFIN_USER_ID,
    CONF_RADARR_CONFIG_ENTRY_ID,
    CONF_REF_SECRET,
    CONF_SONARR_CONFIG_ENTRY_ID,
    CONF_TIMEOUT,
    CONF_URL,
    CONF_VERIFY_SSL,
    DEFAULT_NAME,
    DOMAIN,
)
from custom_components.octopus_media.exceptions import (
    CannotConnectError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
)
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState, ConfigFlowResult
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from tests.fixtures.jellyfin import SERVER_INFO, USERS

CONNECTION = {
    CONF_URL: "https://media.invalid/base/",
    CONF_API_KEY: "<redacted>",
    CONF_VERIFY_SSL: True,
    CONF_TIMEOUT: 10,
}


async def _start_valid_flow(hass: HomeAssistant) -> ConfigFlowResult:
    with (
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_server_info",
            new=AsyncMock(return_value=SERVER_INFO),
        ),
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_users",
            new=AsyncMock(return_value=USERS),
        ),
    ):
        return await hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": config_entries.SOURCE_USER},
            data=CONNECTION,
        )


async def test_config_flow_validates_then_selects_user(hass: HomeAssistant) -> None:
    result = await _start_valid_flow(hass)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "select_user"
    completed = await hass.config_entries.flow.async_configure(
        str(result["flow_id"]),
        {
            CONF_INSTANCE_NAME: "Fixture Media LAB",
            CONF_JELLYFIN_USER_ID: USERS[0]["Id"],
        },
    )
    assert completed["type"] is FlowResultType.CREATE_ENTRY
    assert completed["title"] == "Fixture Media LAB"
    assert completed["options"] == {CONF_INSTANCE_NAME: "Fixture Media LAB"}
    assert completed["data"][CONF_URL] == "https://media.invalid/base"
    assert completed["data"][CONF_JELLYFIN_SERVER_ID] == SERVER_INFO["Id"]
    assert completed["data"][CONF_JELLYFIN_USER_ID] == USERS[0]["Id"]
    assert len(completed["data"][CONF_REF_SECRET]) >= 32


async def test_config_flow_rejects_invalid_url_before_network(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_USER},
        data={**CONNECTION, CONF_URL: "file:///not-allowed"},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_url"}


async def test_config_flow_prevents_duplicate_server(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=f"jellyfin_{SERVER_INFO['Id'].casefold()}",
        data={},
    )
    entry.add_to_hass(hass)
    result = await _start_valid_flow(hass)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_config_flow_reports_no_users(hass: HomeAssistant) -> None:
    with (
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_server_info",
            new=AsyncMock(return_value=SERVER_INFO),
        ),
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_users",
            new=AsyncMock(return_value=[]),
        ),
    ):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}, data=CONNECTION
        )
    assert result["errors"] == {"base": "no_users"}


async def test_config_flow_translates_closed_client_errors(hass: HomeAssistant) -> None:
    cases = [
        (InvalidAuthenticationError(), "invalid_auth"),
        (RequestTimeoutError(), "timeout"),
        (CannotConnectError(), "cannot_connect"),
        (InvalidResponseError(), "invalid_response"),
    ]
    for error, expected in cases:
        with patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_server_info",
            new=AsyncMock(side_effect=error),
        ):
            result = await hass.config_entries.flow.async_init(
                DOMAIN, context={"source": config_entries.SOURCE_USER}, data=CONNECTION
            )
        assert result["errors"] == {"base": expected}


async def test_reauth_updates_connection_but_preserves_user_and_secret(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=f"jellyfin_{SERVER_INFO['Id'].casefold()}",
        title="Fixture Media LAB",
        data={
            **CONNECTION,
            CONF_URL: "https://old.invalid",
            CONF_JELLYFIN_SERVER_ID: SERVER_INFO["Id"],
            CONF_JELLYFIN_USER_ID: USERS[0]["Id"],
            CONF_REF_SECRET: "fixture-reference-secret",
        },
        options={CONF_INSTANCE_NAME: "Fixture Media LAB"},
    )
    entry.add_to_hass(hass)
    start = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": config_entries.SOURCE_REAUTH, "entry_id": entry.entry_id},
        data=dict(entry.data),
    )
    assert start["step_id"] == "reauth_confirm"
    with (
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_server_info",
            new=AsyncMock(return_value=SERVER_INFO),
        ),
        patch(
            "custom_components.octopus_media.config_flow.JellyfinClient.async_get_users",
            new=AsyncMock(return_value=USERS),
        ),
    ):
        result = await hass.config_entries.flow.async_configure(start["flow_id"], CONNECTION)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"
    assert entry.data[CONF_URL] == "https://media.invalid/base"
    assert entry.data[CONF_REF_SECRET] == "fixture-reference-secret"
    assert entry.data[CONF_JELLYFIN_USER_ID] == USERS[0]["Id"]
    assert entry.title == "Fixture Media LAB"
    assert entry.options[CONF_INSTANCE_NAME] == "Fixture Media LAB"


async def test_options_flow_saves_only_active_jellyfin_options(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="Old Fixture Name", data={})
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    data = {
        CONF_INSTANCE_NAME: "Renamed Fixture Media",
        "playing_interval": 12,
        "recent_interval": 240,
        "recent_count": 20,
        "group_episodes": False,
        "language": "pt-BR",
        "date_format": "short",
        CONF_DEVICE_ALIASES: {"fixture-device-a": "Sala"},
    }
    completed = await hass.config_entries.options.async_configure(result["flow_id"], data)
    assert completed["type"] is FlowResultType.CREATE_ENTRY
    assert completed["data"] == data
    assert entry.title == "Renamed Fixture Media"
    assert dict(entry.options) == data
    assert "upcoming_interval" not in completed["data"]
    assert "radarr_date_policy" not in completed["data"]


async def test_options_flow_selects_official_servarr_entries(hass: HomeAssistant) -> None:
    radarr_entry = MockConfigEntry(domain="radarr", title="Fixture Radarr")
    sonarr_entry = MockConfigEntry(domain="sonarr", title="Fixture Sonarr")
    radarr_entry.add_to_hass(hass)
    sonarr_entry.add_to_hass(hass)
    entry = MockConfigEntry(domain=DOMAIN, title="Fixture Media", data={})
    entry.add_to_hass(hass)
    start = await hass.config_entries.options.async_init(entry.entry_id)
    data = {
        CONF_INSTANCE_NAME: "Fixture Media",
        "playing_interval": 12,
        "recent_interval": 240,
        "recent_count": 20,
        "group_episodes": False,
        "language": "pt-BR",
        "date_format": "short",
        CONF_DEVICE_ALIASES: {},
        CONF_RADARR_CONFIG_ENTRY_ID: radarr_entry.entry_id,
        CONF_SONARR_CONFIG_ENTRY_ID: sonarr_entry.entry_id,
    }
    hass.services.async_register("radarr", "get_movies", lambda call: None)
    hass.services.async_register("sonarr", "get_upcoming", lambda call: None)
    original_get_entry = hass.config_entries.async_get_entry

    def get_entry(entry_id: str) -> object:
        if entry_id == radarr_entry.entry_id:
            return type("Entry", (), {"domain": "radarr", "state": ConfigEntryState.LOADED})()
        if entry_id == sonarr_entry.entry_id:
            return type("Entry", (), {"domain": "sonarr", "state": ConfigEntryState.LOADED})()
        return original_get_entry(entry_id)

    with patch.object(hass.config_entries, "async_get_entry", side_effect=get_entry):
        result = await hass.config_entries.options.async_configure(start["flow_id"], data)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options[CONF_RADARR_CONFIG_ENTRY_ID] == radarr_entry.entry_id
    assert entry.options[CONF_SONARR_CONFIG_ENTRY_ID] == sonarr_entry.entry_id


async def test_options_flow_rejects_unloaded_servarr_entry(hass: HomeAssistant) -> None:
    radarr_entry = MockConfigEntry(domain="radarr", title="Fixture Radarr")
    radarr_entry.add_to_hass(hass)
    entry = MockConfigEntry(domain=DOMAIN, title="Fixture Media", data={})
    entry.add_to_hass(hass)
    start = await hass.config_entries.options.async_init(entry.entry_id)
    data = {
        CONF_INSTANCE_NAME: "Fixture Media",
        "playing_interval": 12,
        "recent_interval": 240,
        "recent_count": 20,
        "group_episodes": False,
        "language": "pt-BR",
        "date_format": "short",
        CONF_DEVICE_ALIASES: {},
        CONF_RADARR_CONFIG_ENTRY_ID: radarr_entry.entry_id,
    }
    result = await hass.config_entries.options.async_configure(start["flow_id"], data)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"radarr": "not_loaded"}


async def test_native_entry_rename_synchronizes_public_instance_name(
    hass: HomeAssistant,
) -> None:
    """The native HA rename action remains consistent with the YAML-facing name."""
    from custom_components.octopus_media import _synchronize_instance_name

    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Octopus Media Card — LAB",
        data={},
        options={CONF_INSTANCE_NAME: "Legacy Fixture Name", "recent_count": 9},
    )
    entry.add_to_hass(hass)

    options = _synchronize_instance_name(hass, entry)

    assert options[CONF_INSTANCE_NAME] == "Octopus Media Card — LAB"
    assert entry.options[CONF_INSTANCE_NAME] == "Octopus Media Card — LAB"
    assert entry.options["recent_count"] == 9


async def test_migrate_entry_adds_persistent_instance_name(hass: HomeAssistant) -> None:
    """A 1.2 entry gains the persisted name without changing its identity."""
    from custom_components.octopus_media import async_migrate_entry

    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Fixture Harbor",
        data={},
        options={"recent_count": 9},
        version=1,
        minor_version=2,
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 1
    assert entry.minor_version == 3
    assert entry.title == "Fixture Harbor"
    assert entry.options == {
        "recent_count": 9,
        CONF_INSTANCE_NAME: "Fixture Harbor",
    }


async def test_migrate_entry_uses_default_for_blank_legacy_title(
    hass: HomeAssistant,
) -> None:
    """A blank legacy title receives the stable product default."""
    from custom_components.octopus_media import async_migrate_entry

    entry = MockConfigEntry(
        domain=DOMAIN,
        title="",
        data={},
        version=1,
        minor_version=2,
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.title == DEFAULT_NAME
    assert entry.options[CONF_INSTANCE_NAME] == DEFAULT_NAME
