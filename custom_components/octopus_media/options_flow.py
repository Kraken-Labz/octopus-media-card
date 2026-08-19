"""Small user-facing options flow for Octopus Media."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlowResult, OptionsFlowWithReload

from .const import (
    CONF_GROUP_EPISODES,
    DEFAULT_GROUP_EPISODES,
)

OPTIONS_SCHEMA = vol.Schema({
    vol.Required(CONF_GROUP_EPISODES, default=DEFAULT_GROUP_EPISODES): bool,
})


class OctopusMediaOptionsFlow(OptionsFlowWithReload):
    """Manage only stable, user-facing Octopus Media preferences."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Save episode grouping while preserving legacy internal options."""
        if user_input is not None:
            options = dict(self.config_entry.options)
            options[CONF_GROUP_EPISODES] = bool(user_input[CONF_GROUP_EPISODES])
            return self.async_create_entry(data=options)
        suggested = dict(self.config_entry.options)
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(OPTIONS_SCHEMA, suggested),
        )
