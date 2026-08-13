"""Home Assistant integration options without duplicated service credentials."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlowResult, OptionsFlowWithReload
from homeassistant.helpers import selector

from .const import (
    CONF_DATE_FORMAT,
    CONF_DEVICE_ALIASES,
    CONF_GROUP_EPISODES,
    CONF_INSTANCE_NAME,
    CONF_LANGUAGE,
    CONF_PLAYING_INTERVAL,
    CONF_RADARR_CONFIG_ENTRY_ID,
    CONF_RECENT_COUNT,
    CONF_RECENT_INTERVAL,
    CONF_SONARR_CONFIG_ENTRY_ID,
    DATE_FORMATS,
    DEFAULT_DATE_FORMAT,
    DEFAULT_GROUP_EPISODES,
    DEFAULT_LANGUAGE,
    DEFAULT_NAME,
    DEFAULT_PLAYING_INTERVAL,
    DEFAULT_RECENT_COUNT,
    DEFAULT_RECENT_INTERVAL,
    LANGUAGES,
    MAX_PLAYING_INTERVAL,
    MAX_RECENT_INTERVAL,
    MIN_PLAYING_INTERVAL,
    MIN_RECENT_INTERVAL,
)

OPTIONS_SCHEMA = vol.Schema({
    vol.Required(CONF_INSTANCE_NAME, default=DEFAULT_NAME): selector.TextSelector(),
    vol.Required(CONF_PLAYING_INTERVAL, default=DEFAULT_PLAYING_INTERVAL): vol.All(
        int, vol.Range(min=MIN_PLAYING_INTERVAL, max=MAX_PLAYING_INTERVAL)
    ),
    vol.Required(CONF_RECENT_INTERVAL, default=DEFAULT_RECENT_INTERVAL): vol.All(
        int, vol.Range(min=MIN_RECENT_INTERVAL, max=MAX_RECENT_INTERVAL)
    ),
    vol.Required(CONF_RECENT_COUNT, default=DEFAULT_RECENT_COUNT): vol.All(
        int, vol.Range(min=1, max=50)
    ),
    vol.Required(CONF_GROUP_EPISODES, default=DEFAULT_GROUP_EPISODES): bool,
    vol.Required(CONF_LANGUAGE, default=DEFAULT_LANGUAGE): vol.In(LANGUAGES),
    vol.Required(CONF_DATE_FORMAT, default=DEFAULT_DATE_FORMAT): vol.In(DATE_FORMATS),
    vol.Optional(CONF_DEVICE_ALIASES, default={}): selector.ObjectSelector(),
    vol.Optional(CONF_RADARR_CONFIG_ENTRY_ID): selector.ConfigEntrySelector(
        selector.ConfigEntrySelectorConfig(integration="radarr")
    ),
    vol.Optional(CONF_SONARR_CONFIG_ENTRY_ID): selector.ConfigEntrySelector(
        selector.ConfigEntrySelectorConfig(integration="sonarr")
    ),
})


class OctopusMediaOptionsFlow(OptionsFlowWithReload):
    """Select existing official Radarr/Sonarr ConfigEntries."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Validate provider selections and save only opaque entry IDs."""
        if user_input is not None:
            options = dict(user_input)
            instance_name = str(options[CONF_INSTANCE_NAME]).strip() or DEFAULT_NAME
            options[CONF_INSTANCE_NAME] = instance_name
            errors: dict[str, str] = {}
            for service, entry_key, action in (
                ("radarr", CONF_RADARR_CONFIG_ENTRY_ID, "get_movies"),
                ("sonarr", CONF_SONARR_CONFIG_ENTRY_ID, "get_upcoming"),
            ):
                entry_id = options.get(entry_key)
                if entry_id:
                    error = self._validate_provider_entry(service, str(entry_id), action)
                    if error:
                        errors[service] = error
            if errors:
                return self.async_show_form(
                    step_id="init",
                    data_schema=self.add_suggested_values_to_schema(
                        OPTIONS_SCHEMA, dict(self.config_entry.options, **options)
                    ),
                    errors=errors,
                )
            self.hass.config_entries.async_update_entry(
                self.config_entry,
                title=instance_name,
            )
            return self.async_create_entry(data=options)
        suggested = dict(self.config_entry.options)
        suggested.setdefault(CONF_INSTANCE_NAME, self.config_entry.title or DEFAULT_NAME)
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(OPTIONS_SCHEMA, suggested),
        )

    def _validate_provider_entry(self, service: str, entry_id: str, action: str) -> str | None:
        """Validate public ConfigEntry/service state without reading sensitive data."""
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != service:
            return "not_found"
        if entry.state.name.casefold() != "loaded":
            return "not_loaded"
        if not self.hass.services.has_service(service, action):
            return "action_unavailable"
        return None
