"""Serve the bundled Lovelace card through the public static path API."""

from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import FRONTEND_URL_PATH

_BUNDLE_PATH = Path(__file__).parent / "frontend" / "octopus-media-card.js"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend bundle without modifying Lovelace storage."""
    await hass.http.async_register_static_paths([
        StaticPathConfig(FRONTEND_URL_PATH, str(_BUNDLE_PATH), False)
    ])
