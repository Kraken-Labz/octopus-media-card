"""Jellyfin client contract tests without external network access."""

from __future__ import annotations

from collections.abc import AsyncIterator, Mapping
from typing import Any, cast

import aiohttp
import pytest
from custom_components.octopus_media.api.base import APIClientConfig
from custom_components.octopus_media.api.jellyfin import JellyfinClient
from custom_components.octopus_media.exceptions import (
    CannotConnectError,
    ImageNotFoundError,
    ImagePayloadError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
    UnexpectedHTTPError,
)
from custom_components.octopus_media.image_store import ImageCandidate, ImageKind, ImageVariant

from tests.fixtures.jellyfin import MOVIE, SERVER_INFO, USERS, playing_session


class FakeResponse:
    """Minimal aiohttp response context manager."""

    def __init__(
        self,
        payload: object,
        status: int = 200,
        json_error: Exception | None = None,
        *,
        body: bytes = b"",
        headers: dict[str, str] | None = None,
    ) -> None:
        self.status = status
        self._payload = payload
        self._json_error = json_error
        self.headers = headers or {}
        self.content = FakeContent(body)

    async def __aenter__(self) -> FakeResponse:
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def json(self, *, content_type: None = None) -> object:
        if self._json_error:
            raise self._json_error
        return self._payload


class FakeContent:
    """Minimal bounded async content stream."""

    def __init__(self, body: bytes) -> None:
        self.body = body

    async def iter_chunked(self, size: int) -> AsyncIterator[bytes]:
        for offset in range(0, len(self.body), size):
            yield self.body[offset : offset + size]


class FakeSession:
    """Capture requests and return queued fake responses/errors."""

    def __init__(self, *results: FakeResponse | BaseException) -> None:
        self.results = list(results)
        self.calls: list[tuple[str, dict[str, Any]]] = []

    def get(self, url: str, **kwargs: Any) -> FakeResponse:
        self.calls.append((url, kwargs))
        result = self.results.pop(0)
        if isinstance(result, BaseException):
            raise result
        return result


class FakeHass:
    """Run executor jobs inline for the authenticated-client adapter test."""

    async def async_add_executor_job(self, target: Any, *args: Any, **kwargs: Any) -> object:
        return target(*args, **kwargs)


class FakeHomeAssistantJellyfin:
    """Expose only the official recently-added operation used by the adapter."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, dict[str, str]]] = []

    def get_recently_added(self, **params: Any) -> list[dict[str, Any]]:
        self.calls.append(("", params))
        return [MOVIE]


def client(session: FakeSession) -> JellyfinClient:
    """Build a client with an explicitly redacted test credential."""
    return JellyfinClient(
        cast(aiohttp.ClientSession, session),
        APIClientConfig(
            url="https://media.invalid/base",
            api_key="<redacted>",
            verify_ssl=False,
            timeout=7,
        ),
    )


async def test_server_info_auth_header_timeout_ssl_and_user_agent() -> None:
    session = FakeSession(FakeResponse(SERVER_INFO))
    assert await client(session).async_get_server_info() == SERVER_INFO
    url, kwargs = session.calls[0]
    assert url == "https://media.invalid/base/System/Info"
    assert kwargs["headers"]["Authorization"] == 'MediaBrowser Token="<redacted>"'
    assert "Octopus-Media-Card" in kwargs["headers"]["User-Agent"]
    assert kwargs["ssl"] is False
    assert kwargs["timeout"].total == 7
    assert "params" in kwargs and kwargs["params"] is None


async def test_users_recent_and_sessions_are_typed_arrays() -> None:
    session = FakeSession(
        FakeResponse(USERS),
        FakeResponse([MOVIE]),
        FakeResponse([playing_session()]),
        FakeResponse({
            "Items": [
                {
                    "Id": "fixture-device-a",
                    "Name": "Test Display A",
                    "CustomName": "Fixture Room",
                    "AppName": "Fixture Client",
                }
            ]
        }),
    )
    jellyfin = client(session)
    assert (await jellyfin.async_get_users())[0]["Name"] == "Demo Viewer"
    assert (await jellyfin.async_get_recent_items(USERS[0]["Id"], limit=12))[0]["Type"] == "Movie"
    assert (await jellyfin.async_get_sessions())[0]["DeviceName"] == "Test Display A"
    assert (await jellyfin.async_get_devices())[0]["CustomName"] == "Fixture Room"
    assert session.calls[1][0] == f"https://media.invalid/base/Users/{USERS[0]['Id']}/Items/Latest"
    recent_params = cast(Mapping[str, str], session.calls[1][1]["params"])
    assert recent_params["groupItems"] == "false"
    assert "api_key" not in recent_params
    assert session.calls[3][0] == "https://media.invalid/base/Devices"


async def test_recent_uses_loaded_home_assistant_client_operation() -> None:
    session = FakeSession()
    ha_jellyfin = FakeHomeAssistantJellyfin()
    jellyfin = JellyfinClient(
        cast(aiohttp.ClientSession, session),
        APIClientConfig(url="https://media.invalid/base", api_key="<redacted>"),
        home_assistant_api_client=type("ApiClient", (), {"jellyfin": ha_jellyfin})(),
        hass=cast(Any, FakeHass()),
    )

    items = await jellyfin.async_get_recent_items(USERS[0]["Id"], limit=12)

    assert items == [MOVIE]
    assert len(session.calls) == 0
    assert ha_jellyfin.calls[0][0] == ""
    assert ha_jellyfin.calls[0][1]["media"] == ["Movie", "Episode"]
    assert ha_jellyfin.calls[0][1]["limit"] == 12


@pytest.mark.parametrize(
    "payload",
    [
        [],
        {},
        {"Items": "not-an-array"},
        {"Items": [{}]},
        {"Items": [{"Id": "fixture-device", "CustomName": 42}]},
    ],
)
async def test_devices_reject_malformed_catalog(payload: object) -> None:
    with pytest.raises(InvalidResponseError):
        await client(FakeSession(FakeResponse(payload))).async_get_devices()


@pytest.mark.parametrize("status", [401, 403])
async def test_authentication_rejection_is_distinct_and_redacted(status: int) -> None:
    with pytest.raises(InvalidAuthenticationError) as caught:
        await client(FakeSession(FakeResponse({}, status=status))).async_get_server_info()
    assert "redacted" not in str(caught.value)
    assert "media.invalid" not in str(caught.value)


async def test_timeout_is_distinct() -> None:
    with pytest.raises(RequestTimeoutError):
        await client(FakeSession(TimeoutError())).async_get_server_info()


async def test_unreachable_is_distinct() -> None:
    with pytest.raises(CannotConnectError):
        await client(FakeSession(aiohttp.ClientConnectionError())).async_get_server_info()


async def test_invalid_json_and_shape_are_distinct() -> None:
    with pytest.raises(InvalidResponseError):
        await client(FakeSession(FakeResponse({}, json_error=ValueError()))).async_get_server_info()
    with pytest.raises(InvalidResponseError):
        await client(FakeSession(FakeResponse([]))).async_get_server_info()
    with pytest.raises(InvalidResponseError):
        await client(FakeSession(FakeResponse({"Id": "x"}))).async_get_server_info()


async def test_unexpected_http_preserves_only_status() -> None:
    with pytest.raises(UnexpectedHTTPError) as caught:
        await client(FakeSession(FakeResponse({}, status=502))).async_get_server_info()
    assert caught.value.status == 502
    assert str(caught.value) == "Service returned unexpected HTTP status 502"


async def test_cancellation_is_not_wrapped() -> None:
    import asyncio

    with pytest.raises(asyncio.CancelledError):
        await client(FakeSession(asyncio.CancelledError())).async_get_server_info()


def png(width: int = 160, height: int = 240) -> bytes:
    """Return the bounded header subset consumed by validation."""
    return (
        b"\x89PNG\r\n\x1a\n"
        + b"\x00\x00\x00\rIHDR"
        + width.to_bytes(4, "big")
        + height.to_bytes(4, "big")
        + b"fictional"
    )


async def test_image_download_is_authenticated_bounded_and_revisioned() -> None:
    body = png()
    session = FakeSession(
        FakeResponse(
            {}, body=body, headers={"Content-Type": "image/png", "Content-Length": str(len(body))}
        )
    )
    result = await client(session).async_get_image(
        (ImageCandidate("fictional-media-id", ImageKind.PRIMARY, "revision-a"),),
        ImageVariant.POSTER_SMALL,
    )
    assert result.body == body
    _, kwargs = session.calls[0]
    assert kwargs["params"] == {"maxWidth": "160", "quality": "90", "tag": "revision-a"}
    assert kwargs["allow_redirects"] is False
    assert kwargs["auto_decompress"] is False
    assert kwargs["headers"]["Authorization"] == 'MediaBrowser Token="<redacted>"'


@pytest.mark.parametrize(
    ("headers", "body"),
    [
        ({"Content-Type": "text/html"}, b"<html>no</html>"),
        ({"Content-Type": "image/png"}, b""),
        ({"Content-Type": "image/png"}, b"not-a-png"),
        ({"Content-Type": "image/png", "Content-Length": str(9 * 1024 * 1024)}, png()),
    ],
)
async def test_image_download_rejects_invalid_payloads(
    headers: dict[str, str], body: bytes
) -> None:
    with pytest.raises(ImagePayloadError):
        await client(FakeSession(FakeResponse({}, body=body, headers=headers))).async_get_image(
            (ImageCandidate("fictional-media-id", ImageKind.PRIMARY, "revision-a"),),
            ImageVariant.POSTER_SMALL,
        )


async def test_image_fallback_and_redirect_origin_policy() -> None:
    body = png()
    fallback_session = FakeSession(
        FakeResponse({}, status=404),
        FakeResponse({}, body=body, headers={"Content-Type": "image/png"}),
    )
    result = await client(fallback_session).async_get_image(
        (
            ImageCandidate("episode-id", ImageKind.PRIMARY, "episode-revision"),
            ImageCandidate("series-id", ImageKind.PRIMARY, "series-revision"),
        ),
        ImageVariant.POSTER_MEDIUM,
    )
    assert result.body == body

    allowed = FakeSession(
        FakeResponse({}, status=302, headers={"Location": "/base/cache/image"}),
        FakeResponse({}, body=body, headers={"Content-Type": "image/png"}),
    )
    assert (
        await client(allowed).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )
    ).body == body

    forbidden = FakeSession(
        FakeResponse({}, status=302, headers={"Location": "https://other.invalid/image"})
    )
    with pytest.raises(ImagePayloadError):
        await client(forbidden).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )


async def test_all_image_fallbacks_missing() -> None:
    with pytest.raises(ImageNotFoundError):
        await client(FakeSession(FakeResponse({}, status=404))).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )
