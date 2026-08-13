"""Authenticated and signed-path-compatible image delivery endpoint."""

from __future__ import annotations

import asyncio
import hashlib

import aiohttp
from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api.jellyfin import JellyfinClient
from .const import DOMAIN, IMAGE_URL
from .exceptions import (
    ImageNotFoundError,
    ImageTemporaryError,
    InvalidImageVariantError,
    UnknownImageReferenceError,
)
from .image_cache import ImagePayload
from .image_store import ImageDescriptor
from .models import MediaSource


class OctopusMediaImageView(HomeAssistantView):
    """Return only validated bytes for a registered opaque reference."""

    requires_auth = True
    url = IMAGE_URL
    name = "api:octopus_media:image"

    async def get(
        self,
        request: web.Request,
        entry_id: str,
        image_ref: str,
        variant: str,
    ) -> web.StreamResponse:
        """Resolve a closed request without exposing its Jellyfin origin."""
        hass: HomeAssistant = request.app["hass"]
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN:
            raise web.HTTPNotFound
        try:
            runtime = entry.runtime_data
            descriptor, parsed_variant = runtime.image_store.resolve_request(image_ref, variant)
        except (AttributeError, InvalidImageVariantError, UnknownImageReferenceError):
            raise web.HTTPNotFound from None
        if descriptor.config_entry_id != entry_id:
            raise web.HTTPNotFound
        etag = _image_etag(image_ref, parsed_variant.value)
        common_headers = {
            "Cache-Control": "private, max-age=300",
            "ETag": etag,
            "X-Content-Type-Options": "nosniff",
        }
        if request.headers.get("If-None-Match") == etag:
            return web.Response(status=304, headers=common_headers)
        key = f"{image_ref}:{parsed_variant.value}"
        try:
            payload = await runtime.image_cache.async_get(
                key,
                lambda: (
                    _async_get_provider_image(hass, descriptor)
                    if descriptor.source is MediaSource.RADARR
                    else runtime.client.async_get_image(descriptor.candidates, parsed_variant)
                ),
            )
        except ImageNotFoundError:
            raise web.HTTPNotFound from None
        except ImageTemporaryError:
            raise web.HTTPServiceUnavailable(
                headers={"Retry-After": "30", "X-Content-Type-Options": "nosniff"}
            ) from None
        return web.Response(
            body=payload.body,
            content_type=payload.content_type,
            headers=common_headers,
        )


def _image_etag(image_ref: str, variant: str) -> str:
    digest = hashlib.sha256(f"{image_ref}\x1f{variant}".encode()).hexdigest()[:32]
    return f'"octopus-{digest}"'


async def _async_get_provider_image(
    hass: HomeAssistant, descriptor: ImageDescriptor
) -> ImagePayload:
    """Fetch a registered provider image without forwarding provider credentials."""
    candidates = descriptor.candidates
    session = async_get_clientsession(hass)
    for candidate in candidates:
        origin_url = candidate.origin_url
        if not isinstance(origin_url, str):
            continue
        try:
            async with session.get(
                origin_url,
                headers={"Accept": "image/jpeg, image/png, image/webp"},
                allow_redirects=False,
                auto_decompress=False,
                timeout=aiohttp.ClientTimeout(total=20),
            ) as response:
                if response.status == 404:
                    continue
                if response.status in (301, 302, 303, 307, 308):
                    raise ImageTemporaryError("provider image redirect is not allowed")
                if not 200 <= response.status < 300:
                    raise ImageTemporaryError("provider image request failed")
                return await JellyfinClient._read_image_response(response)
        except asyncio.CancelledError:
            raise
        except ImageTemporaryError:
            raise
        except (aiohttp.ClientError, TimeoutError) as err:
            raise ImageTemporaryError("provider image request failed") from err
    raise ImageNotFoundError("registered provider image is absent")


def async_register_http_views(hass: HomeAssistant) -> None:
    """Register the image view once during integration setup."""
    hass.http.register_view(OctopusMediaImageView())
