"""Import and safe-stub tests."""

import importlib
from typing import cast

import pytest
from aiohttp import ClientSession
from custom_components.octopus_media.api.base import APIClientConfig, BaseMediaClient
from custom_components.octopus_media.exceptions import ClientNotImplementedError


@pytest.mark.parametrize(
    "module",
    [
        "custom_components.octopus_media",
        "custom_components.octopus_media.config_flow",
        "custom_components.octopus_media.options_flow",
        "custom_components.octopus_media.websocket",
        "custom_components.octopus_media.http",
        "custom_components.octopus_media.frontend",
        "custom_components.octopus_media.diagnostics",
        "custom_components.octopus_media.api.jellyfin",
        "custom_components.octopus_media.api.radarr",
        "custom_components.octopus_media.api.sonarr",
        "custom_components.octopus_media.coordinators.recent",
        "custom_components.octopus_media.coordinators.upcoming",
        "custom_components.octopus_media.coordinators.playing",
    ],
)
def test_modules_import_without_side_effects(module: str) -> None:
    """Every scaffold module imports without making external requests."""
    assert importlib.import_module(module)


async def test_api_base_fails_explicitly() -> None:
    """The base client never pretends that a real service was queried."""
    client = BaseMediaClient(
        cast(ClientSession, object()),
        APIClientConfig(url="https://service.example.test", api_key="<redacted>"),
    )
    with pytest.raises(ClientNotImplementedError):
        await client.async_validate()
