"""Authenticated WebSocket scaffold for normalized card data."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection
from homeassistant.core import HomeAssistant, callback

from .const import (
    DOMAIN,
    WS_GET_DETAILS,
    WS_GET_ENTRIES,
    WS_GET_SNAPSHOT,
    WS_REFRESH,
    WS_SUBSCRIBE_SNAPSHOT,
)
from .runtime_data import OctopusMediaRuntimeData


def _runtime_for_entry(hass: HomeAssistant, entry_id: str) -> OctopusMediaRuntimeData | None:
    entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN:
        return None
    try:
        runtime: OctopusMediaRuntimeData = entry.runtime_data
    except AttributeError:
        return None
    return runtime


@websocket_api.websocket_command({vol.Required("type"): WS_GET_ENTRIES})
@websocket_api.async_response
async def websocket_get_entries(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return entry titles and capabilities without credentials."""
    entries: list[dict[str, Any]] = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        runtime = _runtime_for_entry(hass, entry.entry_id)
        if runtime is None:
            continue
        entries.append({
            "entry_id": entry.entry_id,
            "title": entry.title,
            "capabilities": runtime.capabilities.as_dict(),
        })
    connection.send_result(msg["id"], {"entries": entries})


@websocket_api.websocket_command({
    vol.Required("type"): WS_GET_SNAPSHOT,
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_get_snapshot(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return the scaffold's truthful empty snapshot."""
    runtime = _runtime_for_entry(hass, msg["entry_id"])
    if runtime is None:
        connection.send_error(msg["id"], "not_found", "Config entry is not loaded")
        return
    connection.send_result(msg["id"], runtime.snapshot.as_dict())


@websocket_api.websocket_command({
    vol.Required("type"): WS_SUBSCRIBE_SNAPSHOT,
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_subscribe_snapshot(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send an initial snapshot and subscribe to later normalized snapshots."""
    runtime = _runtime_for_entry(hass, msg["entry_id"])
    if runtime is None:
        connection.send_error(msg["id"], "not_found", "Config entry is not loaded")
        return

    @callback
    def forward_snapshot(snapshot: Any) -> None:
        connection.send_event(msg["id"], {"type": "snapshot", "snapshot": snapshot.as_dict()})

    unsubscribe = runtime.subscribe(forward_snapshot)
    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
    connection.send_event(msg["id"], {"type": "snapshot", "snapshot": runtime.snapshot.as_dict()})


@websocket_api.websocket_command({
    vol.Required("type"): WS_GET_DETAILS,
    vol.Required("entry_id"): str,
    vol.Required("ref"): str,
})
@websocket_api.async_response
async def websocket_get_details(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Report that detail caches are intentionally absent in the scaffold."""
    if _runtime_for_entry(hass, msg["entry_id"]) is None:
        connection.send_error(msg["id"], "not_found", "Config entry is not loaded")
        return
    connection.send_error(msg["id"], "not_found", "Media details are not available")


@websocket_api.websocket_command({
    vol.Required("type"): WS_REFRESH,
    vol.Required("entry_id"): str,
    vol.Optional("sections", default=["all"]): [vol.In(("recent", "upcoming", "playing", "all"))],
})
@websocket_api.async_response
async def websocket_refresh(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Rate-limit and refresh only configured media sections."""
    runtime = _runtime_for_entry(hass, msg["entry_id"])
    if runtime is None:
        connection.send_error(msg["id"], "not_found", "Config entry is not loaded")
        return
    accepted, reason = await runtime.async_refresh(set(msg["sections"]))
    connection.send_result(msg["id"], {"accepted": accepted, "reason": reason})


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register the public WebSocket contract."""
    websocket_api.async_register_command(hass, websocket_get_entries)
    websocket_api.async_register_command(hass, websocket_get_snapshot)
    websocket_api.async_register_command(hass, websocket_subscribe_snapshot)
    websocket_api.async_register_command(hass, websocket_get_details)
    websocket_api.async_register_command(hass, websocket_refresh)
