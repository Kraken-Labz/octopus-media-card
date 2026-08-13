"""Authenticated image endpoint skeleton tests."""

from collections.abc import Awaitable, Callable
from types import SimpleNamespace
from unittest.mock import AsyncMock

from aiohttp.test_utils import TestClient
from aiohttp.web import Application, Request
from custom_components.octopus_media.const import DOMAIN
from custom_components.octopus_media.exceptions import ImageNotFoundError, ImageTemporaryError
from custom_components.octopus_media.http import OctopusMediaImageView
from custom_components.octopus_media.image_cache import ImageMemoryCache, ImagePayload
from custom_components.octopus_media.image_store import (
    ImageDescriptor,
    ImageKind,
    ImageReferenceStore,
    ImageVariant,
)
from custom_components.octopus_media.models import MediaSource
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry


async def test_image_view_requires_authentication(
    hass: HomeAssistant,
    hass_client_no_auth: Callable[[], Awaitable[TestClient[Request, Application]]],
) -> None:
    """Unauthenticated image requests are rejected before resolution."""
    assert await async_setup_component(hass, "http", {})
    hass.http.register_view(OctopusMediaImageView())
    client = await hass_client_no_auth()
    response = await client.get(
        "/api/octopus_media/image/fixture_entry_001/not-a-reference/poster-small"
    )
    assert response.status == 401


async def test_image_view_rejects_invalid_reference(
    hass: HomeAssistant,
    hass_client: Callable[[], Awaitable[TestClient[Request, Application]]],
) -> None:
    """Authenticated callers cannot pass a URL or an unknown reference."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        entry_id="fixture_entry_001",
        title="Fixture Media",
        data={},
    )
    entry.add_to_hass(hass)
    entry.runtime_data = SimpleNamespace(image_store=ImageReferenceStore("fixture-secret"))
    assert await async_setup_component(hass, "http", {})
    hass.http.register_view(OctopusMediaImageView())
    client = await hass_client()
    response = await client.get(
        "/api/octopus_media/image/fixture_entry_001/not-a-reference/poster-small"
    )
    assert response.status == 404


async def test_image_view_returns_validated_bytes_etag_and_304(
    hass: HomeAssistant,
    hass_client: Callable[[], Awaitable[TestClient[Request, Application]]],
) -> None:
    """A registered request returns same-origin bytes and supports revalidation."""
    store = ImageReferenceStore(
        "fixture-secret", config_entry_id="fixture_entry_002", server_id="fixture_server"
    )
    reference = store.register(
        ImageDescriptor(
            config_entry_id="fixture_entry_002",
            source=MediaSource.JELLYFIN,
            server_id="fixture_server",
            internal_media_id="fictional-media-id",
            kind=ImageKind.POSTER,
            revision="fixture-revision",
            allowed_variants=(ImageVariant.POSTER_SMALL,),
        )
    )
    entry = MockConfigEntry(
        domain=DOMAIN,
        entry_id="fixture_entry_002",
        title="Fixture Media",
        data={},
    )
    entry.add_to_hass(hass)
    client_api = SimpleNamespace(
        async_get_image=AsyncMock(return_value=ImagePayload(b"fictional-image", "image/jpeg"))
    )
    entry.runtime_data = SimpleNamespace(
        image_store=store,
        image_cache=ImageMemoryCache(),
        client=client_api,
    )
    assert await async_setup_component(hass, "http", {})
    hass.http.register_view(OctopusMediaImageView())
    client = await hass_client()
    response = await client.get(
        f"/api/octopus_media/image/{entry.entry_id}/{reference}/poster-small"
    )
    assert response.status == 200
    assert await response.read() == b"fictional-image"
    assert response.headers["Content-Type"] == "image/jpeg"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Cache-Control"] == "private, max-age=300"
    etag = response.headers["ETag"]
    repeated = await client.get(
        f"/api/octopus_media/image/{entry.entry_id}/{reference}/poster-small",
        headers={"If-None-Match": etag},
    )
    assert repeated.status == 304
    client_api.async_get_image.assert_awaited_once()


async def test_image_view_sanitizes_missing_and_temporary_failures(
    hass: HomeAssistant,
    hass_client: Callable[[], Awaitable[TestClient[Request, Application]]],
) -> None:
    store = ImageReferenceStore(
        "fixture-secret", config_entry_id="fixture_entry_errors", server_id="fixture_server"
    )
    reference = store.register(
        ImageDescriptor(
            config_entry_id="fixture_entry_errors",
            source=MediaSource.JELLYFIN,
            server_id="fixture_server",
            internal_media_id="fictional-media-id",
            kind=ImageKind.PRIMARY,
            revision="fixture-revision",
            allowed_variants=(ImageVariant.POSTER_SMALL,),
        )
    )
    entry = MockConfigEntry(
        domain=DOMAIN, entry_id="fixture_entry_errors", title="Fixture Media", data={}
    )
    entry.add_to_hass(hass)
    cache_get = AsyncMock(side_effect=ImageNotFoundError())
    entry.runtime_data = SimpleNamespace(
        image_store=store,
        image_cache=SimpleNamespace(async_get=cache_get),
        client=SimpleNamespace(async_get_image=AsyncMock()),
    )
    assert await async_setup_component(hass, "http", {})
    hass.http.register_view(OctopusMediaImageView())
    client = await hass_client()
    path = f"/api/octopus_media/image/{entry.entry_id}/{reference}/poster-small"
    assert (await client.get(path)).status == 404
    cache_get.side_effect = ImageTemporaryError()
    response = await client.get(path)
    assert response.status == 503
    assert response.headers["Retry-After"] == "30"
