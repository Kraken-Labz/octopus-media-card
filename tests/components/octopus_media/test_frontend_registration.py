"""Automatic frontend bundle registration tests."""

from unittest.mock import AsyncMock, patch

from custom_components.octopus_media.const import FRONTEND_URL_PATH
from custom_components.octopus_media.frontend import async_register_frontend
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant


async def test_registers_static_bundle_and_extra_module(hass: HomeAssistant) -> None:
    """The bundle is served and loaded by the HA frontend automatically."""
    register_static_paths = AsyncMock()
    with (
        patch.object(hass.http, "async_register_static_paths", register_static_paths),
        patch("custom_components.octopus_media.frontend.add_extra_js_url") as add_extra_js_url,
    ):
        await async_register_frontend(hass)

    register_static_paths.assert_awaited_once()
    assert register_static_paths.await_args is not None
    [static_path] = register_static_paths.await_args.args[0]
    assert static_path.url_path == FRONTEND_URL_PATH
    assert static_path.path.endswith("octopus-media-card.js")
    add_extra_js_url.assert_called_once_with(hass, FRONTEND_URL_PATH)


async def test_extra_module_url_remains_unique_across_repeated_setup(hass: HomeAssistant) -> None:
    """Home Assistant stores extra module URLs in a set across setup reloads."""
    module_urls: set[str] = set()
    hass.data.update({DATA_EXTRA_MODULE_URL: module_urls})
    with patch.object(hass.http, "async_register_static_paths", AsyncMock()):
        await async_register_frontend(hass)
        await async_register_frontend(hass)

    assert module_urls == {FRONTEND_URL_PATH}
