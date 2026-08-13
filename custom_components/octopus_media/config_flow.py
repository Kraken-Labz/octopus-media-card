"""Config flow for a validated Jellyfin installation."""

from __future__ import annotations

import secrets
from typing import Any
from urllib.parse import urlsplit

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult
from homeassistant.core import callback
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api.base import APIClientConfig
from .api.jellyfin import JellyfinClient
from .api.jellyfin_types import JellyfinServerInfo, JellyfinUser
from .const import (
    CONF_API_KEY,
    CONF_INSTANCE_NAME,
    CONF_JELLYFIN_SERVER_ID,
    CONF_JELLYFIN_USER_ID,
    CONF_REF_SECRET,
    CONF_TIMEOUT,
    CONF_URL,
    CONF_VERIFY_SSL,
    DEFAULT_NAME,
    DEFAULT_TIMEOUT,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    MAX_TIMEOUT,
    MIN_TIMEOUT,
)
from .exceptions import (
    CannotConnectError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
    UnexpectedHTTPError,
)
from .options_flow import OctopusMediaOptionsFlow


def _connection_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    values = defaults or {}
    return vol.Schema({
        vol.Required(CONF_URL, default=values.get(CONF_URL, "http://")): selector.TextSelector(
            selector.TextSelectorConfig(type=selector.TextSelectorType.URL)
        ),
        vol.Required(CONF_API_KEY, default=values.get(CONF_API_KEY, "")): selector.TextSelector(
            selector.TextSelectorConfig(type=selector.TextSelectorType.PASSWORD)
        ),
        vol.Required(
            CONF_VERIFY_SSL, default=values.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
        ): bool,
        vol.Required(CONF_TIMEOUT, default=values.get(CONF_TIMEOUT, DEFAULT_TIMEOUT)): vol.All(
            int, vol.Range(min=MIN_TIMEOUT, max=MAX_TIMEOUT)
        ),
    })


class OctopusMediaConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Validate Jellyfin, then bind one selected user."""

    VERSION = 1
    MINOR_VERSION = 3

    _connection_data: dict[str, Any]
    _server_info: JellyfinServerInfo
    _users: list[JellyfinUser]

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Collect and validate Jellyfin connection settings."""
        errors: dict[str, str] = {}
        if user_input is not None:
            normalized = self._normalize_connection_input(user_input)
            if normalized is None:
                errors["base"] = "invalid_url"
            else:
                try:
                    server_info, users = await self._async_validate_connection(normalized)
                except Exception as err:
                    errors["base"] = self._flow_error(err)
                else:
                    if not users:
                        errors["base"] = "no_users"
                    else:
                        await self.async_set_unique_id(f"jellyfin_{server_info['Id'].casefold()}")
                        self._abort_if_unique_id_configured()
                        self._connection_data = normalized
                        self._server_info = server_info
                        self._users = users
                        return await self.async_step_select_user()
        return self.async_show_form(
            step_id="user", data_schema=_connection_schema(user_input), errors=errors
        )

    async def async_step_select_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Select the Jellyfin user used for recent media."""
        choices = {user["Id"]: user["Name"] for user in self._users}
        if user_input is not None:
            user_id = str(user_input[CONF_JELLYFIN_USER_ID])
            instance_name = str(user_input[CONF_INSTANCE_NAME]).strip() or DEFAULT_NAME
            return self.async_create_entry(
                title=instance_name,
                data={
                    **self._connection_data,
                    CONF_JELLYFIN_SERVER_ID: self._server_info["Id"],
                    CONF_JELLYFIN_USER_ID: user_id,
                    CONF_REF_SECRET: secrets.token_urlsafe(32),
                },
                options={CONF_INSTANCE_NAME: instance_name},
            )
        return self.async_show_form(
            step_id="select_user",
            data_schema=vol.Schema({
                vol.Required(CONF_INSTANCE_NAME, default=DEFAULT_NAME): selector.TextSelector(),
                vol.Required(CONF_JELLYFIN_USER_ID): vol.In(choices),
            }),
        )

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> ConfigFlowResult:
        """Start reauthentication for an existing entry."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Validate replacement credentials and reload the entry."""
        entry = self._get_reauth_entry()
        errors: dict[str, str] = {}
        defaults = dict(entry.data)
        if user_input is not None:
            normalized = self._normalize_connection_input(user_input)
            if normalized is None:
                errors["base"] = "invalid_url"
            else:
                try:
                    server_info, users = await self._async_validate_connection(normalized)
                except Exception as err:
                    errors["base"] = self._flow_error(err)
                else:
                    known_user_ids = {user["Id"] for user in users}
                    if server_info["Id"] != entry.data[CONF_JELLYFIN_SERVER_ID]:
                        errors["base"] = "wrong_server"
                    elif entry.data[CONF_JELLYFIN_USER_ID] not in known_user_ids:
                        errors["base"] = "user_not_found"
                    else:
                        return self.async_update_reload_and_abort(
                            entry,
                            data_updates=normalized,
                        )
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=_connection_schema(user_input or defaults),
            errors=errors,
        )

    async def _async_validate_connection(
        self, data: dict[str, Any]
    ) -> tuple[JellyfinServerInfo, list[JellyfinUser]]:
        client = JellyfinClient(
            async_get_clientsession(self.hass),
            APIClientConfig(
                url=data[CONF_URL],
                api_key=data[CONF_API_KEY],
                verify_ssl=data[CONF_VERIFY_SSL],
                timeout=float(data[CONF_TIMEOUT]),
            ),
        )
        server_info = await client.async_get_server_info()
        users = await client.async_get_users()
        return server_info, users

    @staticmethod
    def _normalize_connection_input(user_input: dict[str, Any]) -> dict[str, Any] | None:
        url = str(user_input[CONF_URL]).strip().rstrip("/")
        parsed = urlsplit(url)
        api_key = str(user_input[CONF_API_KEY]).strip()
        if parsed.scheme not in ("http", "https") or not parsed.netloc or not api_key:
            return None
        return {
            CONF_URL: url,
            CONF_API_KEY: api_key,
            CONF_VERIFY_SSL: bool(user_input[CONF_VERIFY_SSL]),
            CONF_TIMEOUT: int(user_input[CONF_TIMEOUT]),
        }

    @staticmethod
    def _flow_error(err: Exception) -> str:
        if isinstance(err, InvalidAuthenticationError):
            return "invalid_auth"
        if isinstance(err, RequestTimeoutError):
            return "timeout"
        if isinstance(err, CannotConnectError):
            return "cannot_connect"
        if isinstance(err, InvalidResponseError):
            return "invalid_response"
        if isinstance(err, UnexpectedHTTPError):
            return "unexpected_http"
        return "unknown"

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OctopusMediaOptionsFlow:
        """Create the options flow."""
        return OctopusMediaOptionsFlow()
