"""Config flow for selecting existing Home Assistant media integrations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_INSTANCE_NAME,
    CONF_JELLYFIN_CONFIG_ENTRY_ID,
    CONF_RADARR_CONFIG_ENTRY_ID,
    CONF_SONARR_CONFIG_ENTRY_ID,
    DEFAULT_NAME,
    DOMAIN,
)
from .options_flow import OctopusMediaOptionsFlow


def _source_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    values = defaults or {}
    jellyfin_field = (
        vol.Required(CONF_JELLYFIN_CONFIG_ENTRY_ID, default=values[CONF_JELLYFIN_CONFIG_ENTRY_ID])
        if CONF_JELLYFIN_CONFIG_ENTRY_ID in values
        else vol.Required(CONF_JELLYFIN_CONFIG_ENTRY_ID)
    )
    return vol.Schema({
        vol.Required(
            CONF_INSTANCE_NAME, default=values.get(CONF_INSTANCE_NAME, DEFAULT_NAME)
        ): selector.TextSelector(),
        jellyfin_field: selector.ConfigEntrySelector(
            selector.ConfigEntrySelectorConfig(integration="jellyfin")
        ),
        vol.Optional(CONF_RADARR_CONFIG_ENTRY_ID): selector.ConfigEntrySelector(
            selector.ConfigEntrySelectorConfig(integration="radarr")
        ),
        vol.Optional(CONF_SONARR_CONFIG_ENTRY_ID): selector.ConfigEntrySelector(
            selector.ConfigEntrySelectorConfig(integration="sonarr")
        ),
    })


class OctopusMediaConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Bind Octopus Media to existing Home Assistant ConfigEntries."""

    VERSION = 1
    MINOR_VERSION = 3

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Select existing media integrations."""
        if not self._has_loaded_entry("jellyfin"):
            return self.async_abort(reason="jellyfin_not_configured")
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_sources(user_input)
            if not errors:
                name = str(user_input[CONF_INSTANCE_NAME]).strip() or DEFAULT_NAME
                return self.async_create_entry(
                    title=name,
                    data={
                        CONF_JELLYFIN_CONFIG_ENTRY_ID: str(
                            user_input[CONF_JELLYFIN_CONFIG_ENTRY_ID]
                        ),
                        **self._optional_sources(user_input),
                    },
                    options={"group_episodes": True, CONF_INSTANCE_NAME: name},
                )
        return self.async_show_form(
            step_id="user",
            data_schema=_source_schema(user_input or self._source_defaults()),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Change the selected media sources without recreating the entry."""
        entry = self._get_reconfigure_entry()
        defaults = {
            CONF_INSTANCE_NAME: entry.title or DEFAULT_NAME,
            **entry.data,
        }
        if user_input is not None:
            errors = self._validate_sources(user_input)
            if not errors:
                name = str(user_input[CONF_INSTANCE_NAME]).strip() or DEFAULT_NAME
                return self.async_update_reload_and_abort(
                    entry,
                    title=name,
                    data_updates={
                        CONF_JELLYFIN_CONFIG_ENTRY_ID: str(
                            user_input[CONF_JELLYFIN_CONFIG_ENTRY_ID]
                        ),
                        **self._optional_sources(user_input),
                    },
                    reason="reconfigure_successful",
                )
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_source_schema(defaults),
            errors=errors if user_input is not None else {},
        )

    def _validate_sources(self, user_input: dict[str, Any]) -> dict[str, str]:
        errors: dict[str, str] = {}
        jellyfin_id = str(user_input.get(CONF_JELLYFIN_CONFIG_ENTRY_ID, "")).strip()
        jellyfin = self.hass.config_entries.async_get_entry(jellyfin_id)
        if jellyfin is None or jellyfin.domain != "jellyfin":
            errors[CONF_JELLYFIN_CONFIG_ENTRY_ID] = "jellyfin_not_configured"
        elif jellyfin.state.name.casefold() != "loaded":
            errors[CONF_JELLYFIN_CONFIG_ENTRY_ID] = "source_not_loaded"
        for key, domain in (
            (CONF_RADARR_CONFIG_ENTRY_ID, "radarr"),
            (CONF_SONARR_CONFIG_ENTRY_ID, "sonarr"),
        ):
            value = str(user_input.get(key, "")).strip()
            if not value:
                continue
            entry = self.hass.config_entries.async_get_entry(value)
            if entry is None or entry.domain != domain:
                errors[key] = "source_not_found"
            elif entry.state.name.casefold() != "loaded":
                errors[key] = "source_not_loaded"
        return errors

    @staticmethod
    def _optional_sources(user_input: dict[str, Any]) -> dict[str, str]:
        return {
            key: str(user_input[key])
            for key in (CONF_RADARR_CONFIG_ENTRY_ID, CONF_SONARR_CONFIG_ENTRY_ID)
            if str(user_input.get(key, "")).strip()
        }

    def _has_loaded_entry(self, domain: str) -> bool:
        return any(
            entry.state.name.casefold() == "loaded"
            for entry in self.hass.config_entries.async_entries(domain)
        )

    def _source_defaults(self) -> dict[str, str]:
        entries = [
            entry
            for entry in self.hass.config_entries.async_entries("jellyfin")
            if entry.state.name.casefold() == "loaded"
        ]
        return {CONF_JELLYFIN_CONFIG_ENTRY_ID: entries[0].entry_id} if len(entries) == 1 else {}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OctopusMediaOptionsFlow:
        """Create the options flow."""
        return OctopusMediaOptionsFlow()
