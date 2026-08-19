"""Small asynchronous Jellyfin API client for recent and playing data."""

from __future__ import annotations

import asyncio
from collections.abc import Mapping
from functools import partial
from typing import Any, cast

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from yarl import URL

from ..const import JELLYFIN_USER_AGENT
from ..exceptions import (
    CannotConnectError,
    ImageNotFoundError,
    ImagePayloadError,
    ImageTemporaryError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
    UnexpectedHTTPError,
)
from ..image_cache import IMAGE_MAX_BYTES, ImagePayload
from ..image_store import IMAGE_VARIANT_SPECS, ImageCandidate, ImageVariant
from .base import APIClientConfig, BaseMediaClient
from .jellyfin_types import (
    JellyfinDevice,
    JellyfinMediaItem,
    JellyfinServerInfo,
    JellyfinSession,
    JellyfinUser,
)


class JellyfinClient(BaseMediaClient):
    """Call only the documented Jellyfin Phase 3A endpoints."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        config: APIClientConfig,
        *,
        home_assistant_api_client: Any | None = None,
        hass: HomeAssistant | None = None,
    ) -> None:
        """Store the optional authenticated Home Assistant Jellyfin client."""
        super().__init__(session, config)
        self._home_assistant_api_client = home_assistant_api_client
        self._hass = hass

    @classmethod
    def from_home_assistant_entry(
        cls, hass: HomeAssistant, entry: ConfigEntry
    ) -> tuple[JellyfinClient, str, str]:
        """Reuse the authenticated client owned by HA's Jellyfin ConfigEntry."""
        runtime = getattr(entry, "runtime_data", None)
        api_client = getattr(runtime, "api_client", None)
        config_data = getattr(getattr(api_client, "config", None), "data", {})
        token = config_data.get("auth.token") or config_data.get("auth.access_token")
        url = entry.data.get("url")
        user_id = getattr(runtime, "user_id", None)
        server_id = getattr(runtime, "server_id", None)
        if not all(
            isinstance(value, str) and value.strip() for value in (url, token, user_id, server_id)
        ):
            raise CannotConnectError("Jellyfin ConfigEntry is not ready")
        return (
            cls(
                async_get_clientsession(hass),
                APIClientConfig(
                    url=str(url),
                    api_key=str(token),
                    verify_ssl=str(url).casefold().startswith("https://"),
                    timeout=10,
                ),
                home_assistant_api_client=api_client,
                hass=hass,
            ),
            str(user_id),
            str(server_id),
        )

    async def async_validate(self) -> JellyfinServerInfo:
        """Validate server identity and API key."""
        return await self.async_get_server_info()

    async def async_get_server_info(self) -> JellyfinServerInfo:
        """Return a validated stable Jellyfin server identity."""
        payload = await self._async_get_json("System/Info")
        data = self._require_mapping(payload)
        return JellyfinServerInfo(
            Id=self._require_string(data, "Id"),
            ServerName=self._require_string(data, "ServerName"),
            Version=self._require_string(data, "Version"),
        )

    async def async_get_users(self) -> list[JellyfinUser]:
        """Return enabled users available to the configured API key."""
        payload = await self._async_get_json("Users", params={"isDisabled": "false"})
        if not isinstance(payload, list):
            raise InvalidResponseError("Jellyfin users response must be an array")
        users: list[JellyfinUser] = []
        for raw_user in payload:
            data = self._require_mapping(raw_user)
            users.append(
                JellyfinUser(
                    Id=self._require_string(data, "Id"),
                    Name=self._require_string(data, "Name"),
                )
            )
        return users

    async def async_get_recent_items(self, user_id: str, *, limit: int) -> list[JellyfinMediaItem]:
        """Return ungrouped Movie and Episode BaseItemDto values."""
        if self._home_assistant_api_client is not None and self._hass is not None:
            return await self._async_get_recent_items_from_home_assistant(user_id, limit=limit)
        payload = await self._async_get_json(
            f"Users/{user_id}/Items/Latest",
            params={
                "includeItemTypes": "Movie,Episode",
                "fields": (
                    "DateCreated,ParentPrimaryImageItemId,ParentPrimaryImageTag,"
                    "SeriesPrimaryImageTag"
                ),
                "enableImages": "true",
                "imageTypeLimit": "1",
                "enableImageTypes": "Primary,Backdrop",
                "enableUserData": "false",
                "limit": str(max(1, min(limit, 200))),
                "groupItems": "false",
            },
        )
        return self._require_object_array(payload, "recent items")

    async def _async_get_recent_items_from_home_assistant(
        self, user_id: str, *, limit: int
    ) -> list[JellyfinMediaItem]:
        """Use Home Assistant Jellyfin's public recently-added operation."""
        jellyfin = getattr(self._home_assistant_api_client, "jellyfin", None)
        get_recently_added = getattr(jellyfin, "get_recently_added", None)
        if not callable(get_recently_added):
            raise InvalidResponseError("Home Assistant Jellyfin client lacks get_recently_added")
        request = partial(
            get_recently_added,
            media=["Movie", "Episode"],
            limit=max(1, min(limit, 200)),
            fields=[
                "DateCreated",
                "ParentPrimaryImageItemId",
                "ParentPrimaryImageTag",
                "SeriesPrimaryImageTag",
            ],
            enable_image_types=["Primary", "Backdrop"],
            image_type_limit=1,
            enable_total_record_count=False,
        )
        hass = self._hass
        assert hass is not None
        result = await hass.async_add_executor_job(request)
        return self._require_object_array(result, "recent items")

    async def async_get_sessions(self) -> list[JellyfinSession]:
        """Return Jellyfin sessions; normalization filters active media."""
        payload = await self._async_get_json("Sessions")
        return cast(list[JellyfinSession], self._require_object_array(payload, "sessions"))

    async def async_get_devices(self) -> list[JellyfinDevice]:
        """Return the authenticated Jellyfin device catalog."""
        payload = await self._async_get_json("Devices")
        data = self._require_mapping(payload)
        raw_items = data.get("Items")
        if not isinstance(raw_items, list):
            raise InvalidResponseError("Jellyfin devices response must contain an Items array")
        devices: list[JellyfinDevice] = []
        for raw_device in raw_items:
            raw = self._require_mapping(raw_device)
            values: dict[str, str | None] = {}
            for key in ("Name", "CustomName", "AppName"):
                raw_value = raw.get(key)
                if raw_value is not None and not isinstance(raw_value, str):
                    raise InvalidResponseError(f"Jellyfin device response has invalid field {key}")
                values[key] = raw_value
            devices.append(
                JellyfinDevice(
                    Id=self._require_string(raw, "Id"),
                    Name=values["Name"],
                    CustomName=values["CustomName"],
                    AppName=values["AppName"],
                )
            )
        return devices

    async def async_get_image(
        self, candidates: tuple[ImageCandidate, ...], variant: ImageVariant
    ) -> ImagePayload:
        """Download the first valid image in a registered fallback chain."""
        spec = IMAGE_VARIANT_SPECS[variant]
        for candidate in candidates:
            if candidate.kind is not spec.kind:
                raise ImagePayloadError("image candidate and variant do not match")
            try:
                return await self._async_get_image_candidate(candidate, variant)
            except ImageNotFoundError:
                continue
        raise ImageNotFoundError("registered Jellyfin image is absent")

    async def _async_get_image_candidate(
        self, candidate: ImageCandidate, variant: ImageVariant
    ) -> ImagePayload:
        spec = IMAGE_VARIANT_SPECS[variant]
        path = f"Items/{candidate.internal_media_id}/Images/{candidate.kind.value}"
        params = {
            "maxWidth": str(spec.max_width),
            "quality": str(spec.quality),
            "tag": candidate.revision,
        }
        if candidate.kind.value == "Backdrop":
            params["imageIndex"] = "0"
        url = URL(f"{self._config.url.rstrip('/')}/{path}")
        return await self._async_download_image(url, params=params, redirected=False)

    async def _async_download_image(
        self, url: URL, *, params: Mapping[str, str] | None, redirected: bool
    ) -> ImagePayload:
        headers = {
            "Accept": "image/jpeg, image/png, image/webp",
            "Authorization": f'MediaBrowser Token="{self._config.api_key}"',
            "User-Agent": JELLYFIN_USER_AGENT,
        }
        timeout = aiohttp.ClientTimeout(total=self._config.timeout)
        try:
            async with self._session.get(
                url,
                params=params,
                headers=headers,
                ssl=self._config.verify_ssl,
                timeout=timeout,
                allow_redirects=False,
                auto_decompress=False,
            ) as response:
                if response.status in (301, 302, 303, 307, 308):
                    location = response.headers.get("Location")
                    target = url.join(URL(location)) if location else None
                    if redirected or target is None or target.origin() != url.origin():
                        raise ImagePayloadError("image redirect is not allowed")
                    return await self._async_download_image(target, params=None, redirected=True)
                if response.status in (401, 403):
                    raise InvalidAuthenticationError("Jellyfin rejected the configured credential")
                if response.status == 404:
                    raise ImageNotFoundError("Jellyfin image is absent")
                if not 200 <= response.status < 300:
                    raise ImageTemporaryError("Jellyfin image request failed")
                return await self._read_image_response(response)
        except asyncio.CancelledError:
            raise
        except (ImageNotFoundError, ImagePayloadError, ImageTemporaryError):
            raise
        except InvalidAuthenticationError:
            raise ImageTemporaryError("Jellyfin image authentication failed") from None
        except TimeoutError as err:
            raise ImageTemporaryError("Jellyfin image request timed out") from err
        except aiohttp.ClientError as err:
            raise ImageTemporaryError("Jellyfin image request failed") from err

    @staticmethod
    async def _read_image_response(response: aiohttp.ClientResponse) -> ImagePayload:
        content_type = response.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise ImagePayloadError("Jellyfin returned a disallowed image content type")
        if response.headers.get("Content-Encoding", "").lower() not in {"", "identity"}:
            raise ImagePayloadError("compressed image transport is not allowed")
        content_length = response.headers.get("Content-Length")
        if content_length:
            try:
                declared_size = int(content_length)
            except ValueError as err:
                raise ImagePayloadError("invalid image content length") from err
            if declared_size <= 0 or declared_size > IMAGE_MAX_BYTES:
                raise ImagePayloadError("image content length violates bounds")
        chunks: list[bytes] = []
        size = 0
        async for chunk in response.content.iter_chunked(64 * 1024):
            size += len(chunk)
            if size > IMAGE_MAX_BYTES:
                raise ImagePayloadError("image body violates byte limit")
            chunks.append(chunk)
        body = b"".join(chunks)
        if not body:
            raise ImagePayloadError("image body is empty")
        _validate_image_dimensions(body, content_type)
        return ImagePayload(body, content_type)

    async def _async_get_json(self, path: str, *, params: Mapping[str, str] | None = None) -> Any:
        """Issue a redaction-safe authenticated GET and decode JSON."""
        url = f"{self._config.url.rstrip('/')}/{path.lstrip('/')}"
        headers = {
            "Accept": "application/json",
            "Authorization": f'MediaBrowser Token="{self._config.api_key}"',
            "User-Agent": JELLYFIN_USER_AGENT,
        }
        timeout = aiohttp.ClientTimeout(total=self._config.timeout)
        try:
            async with self._session.get(
                url,
                params=params,
                headers=headers,
                ssl=self._config.verify_ssl,
                timeout=timeout,
            ) as response:
                if response.status in (401, 403):
                    raise InvalidAuthenticationError("Jellyfin rejected the configured credential")
                if not 200 <= response.status < 300:
                    raise UnexpectedHTTPError(response.status)
                try:
                    return await response.json(content_type=None)
                except (aiohttp.ContentTypeError, ValueError, UnicodeDecodeError) as err:
                    raise InvalidResponseError("Jellyfin returned invalid JSON") from err
        except asyncio.CancelledError:
            raise
        except InvalidAuthenticationError:
            raise
        except (InvalidResponseError, UnexpectedHTTPError):
            raise
        except TimeoutError as err:
            raise RequestTimeoutError("Jellyfin request timed out") from err
        except aiohttp.ClientConnectionError as err:
            raise CannotConnectError("Jellyfin server is unreachable") from err
        except aiohttp.ClientError as err:
            raise CannotConnectError("Jellyfin request could not be completed") from err

    @staticmethod
    def _require_mapping(value: object) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise InvalidResponseError("Jellyfin response item must be an object")
        return cast(dict[str, Any], value)

    @staticmethod
    def _require_string(data: Mapping[str, Any], key: str) -> str:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip():
            raise InvalidResponseError(f"Jellyfin response is missing required field {key}")
        return value

    @classmethod
    def _require_object_array(cls, payload: object, name: str) -> list[JellyfinMediaItem]:
        if not isinstance(payload, list):
            raise InvalidResponseError(f"Jellyfin {name} response must be an array")
        return cast(list[JellyfinMediaItem], [cls._require_mapping(item) for item in payload])


def _validate_image_dimensions(body: bytes, content_type: str) -> None:
    """Read dimensions from safe headers and reject oversized decoded images."""
    width: int
    height: int
    if content_type == "image/png" and body.startswith(b"\x89PNG\r\n\x1a\n") and len(body) >= 24:
        width = int.from_bytes(body[16:20], "big")
        height = int.from_bytes(body[20:24], "big")
    elif content_type == "image/jpeg" and body.startswith(b"\xff\xd8"):
        width, height = _jpeg_dimensions(body)
    elif content_type == "image/webp" and body.startswith(b"RIFF") and body[8:12] == b"WEBP":
        width, height = _webp_dimensions(body)
    else:
        raise ImagePayloadError("image signature does not match content type")
    if width <= 0 or height <= 0 or width > 8192 or height > 8192 or width * height > 24_000_000:
        raise ImagePayloadError("decoded image dimensions violate bounds")


def _jpeg_dimensions(body: bytes) -> tuple[int, int]:
    offset = 2
    start_of_frame = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while offset + 8 < len(body):
        if body[offset] != 0xFF:
            offset += 1
            continue
        marker = body[offset + 1]
        offset += 2
        if marker in {0xD8, 0xD9}:
            continue
        if offset + 2 > len(body):
            break
        length = int.from_bytes(body[offset : offset + 2], "big")
        if length < 2 or offset + length > len(body):
            break
        if marker in start_of_frame and length >= 7:
            return (
                int.from_bytes(body[offset + 5 : offset + 7], "big"),
                int.from_bytes(body[offset + 3 : offset + 5], "big"),
            )
        offset += length
    raise ImagePayloadError("JPEG dimensions are unavailable")


def _webp_dimensions(body: bytes) -> tuple[int, int]:
    if len(body) >= 30 and body[12:16] == b"VP8X":
        return (
            1 + int.from_bytes(body[24:27], "little"),
            1 + int.from_bytes(body[27:30], "little"),
        )
    if len(body) >= 30 and body[12:16] == b"VP8 ":
        return (
            int.from_bytes(body[26:28], "little") & 0x3FFF,
            int.from_bytes(body[28:30], "little") & 0x3FFF,
        )
    if len(body) >= 25 and body[12:16] == b"VP8L" and body[20] == 0x2F:
        bits = int.from_bytes(body[21:25], "little")
        return ((bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1)
    raise ImagePayloadError("WebP dimensions are unavailable")
