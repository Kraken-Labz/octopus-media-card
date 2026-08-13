"""Image transport and decoded-dimension validation edge cases."""

import asyncio

import aiohttp
import pytest
from custom_components.octopus_media.api.jellyfin import (
    _validate_image_dimensions,
)
from custom_components.octopus_media.exceptions import ImagePayloadError, ImageTemporaryError
from custom_components.octopus_media.image_store import ImageCandidate, ImageKind, ImageVariant

from .test_jellyfin_client import FakeResponse, FakeSession, client, png


def jpeg(width: int = 160, height: int = 240) -> bytes:
    return (
        b"\xff\xd8\xff\xe0\x00\x04\x00\x00\xff\xc0\x00\x07\x08"
        + height.to_bytes(2, "big")
        + width.to_bytes(2, "big")
        + b"\x00\xff\xd9"
    )


def webp_extended(width: int = 160, height: int = 240) -> bytes:
    body = bytearray(b"RIFF" + b"\x00" * 4 + b"WEBPVP8X" + b"\x00" * 14)
    body[24:27] = (width - 1).to_bytes(3, "little")
    body[27:30] = (height - 1).to_bytes(3, "little")
    return bytes(body)


@pytest.mark.parametrize(
    ("body", "content_type"),
    [(jpeg(), "image/jpeg"), (webp_extended(), "image/webp"), (png(), "image/png")],
)
def test_supported_image_headers_have_bounded_dimensions(body: bytes, content_type: str) -> None:
    _validate_image_dimensions(body, content_type)


@pytest.mark.parametrize(
    ("body", "content_type"),
    [
        (png(9000, 1), "image/png"),
        (b"\xff\xd8broken", "image/jpeg"),
        (b"RIFF\x00\x00\x00\x00WEBPbad", "image/webp"),
        (b"not-an-image", "image/png"),
    ],
)
def test_invalid_or_oversized_decoded_images_are_rejected(body: bytes, content_type: str) -> None:
    with pytest.raises(ImagePayloadError):
        _validate_image_dimensions(body, content_type)


@pytest.mark.parametrize(
    "result",
    [
        FakeResponse({}, status=401),
        FakeResponse({}, status=503),
        TimeoutError(),
        aiohttp.ClientConnectionError(),
    ],
)
async def test_image_transport_failures_are_sanitized(
    result: FakeResponse | BaseException,
) -> None:
    with pytest.raises(ImageTemporaryError):
        await client(FakeSession(result)).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )


async def test_backdrop_uses_fixed_index_and_redirect_chain_is_bounded() -> None:
    body = png()
    session = FakeSession(FakeResponse({}, body=body, headers={"Content-Type": "image/png"}))
    await client(session).async_get_image(
        (ImageCandidate("movie-id", ImageKind.BACKDROP, "revision"),),
        ImageVariant.BACKDROP_SMALL,
    )
    assert session.calls[0][1]["params"]["imageIndex"] == "0"

    redirected = FakeSession(
        FakeResponse({}, status=302, headers={"Location": "/base/one"}),
        FakeResponse({}, status=302, headers={"Location": "/base/two"}),
    )
    with pytest.raises(ImagePayloadError):
        await client(redirected).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )


async def test_cancellation_and_candidate_kind_mismatch_fail_closed() -> None:
    with pytest.raises(asyncio.CancelledError):
        await client(FakeSession(asyncio.CancelledError())).async_get_image(
            (ImageCandidate("movie-id", ImageKind.PRIMARY, "revision"),),
            ImageVariant.POSTER_SMALL,
        )
    with pytest.raises(ImagePayloadError):
        await client(FakeSession()).async_get_image(
            (ImageCandidate("movie-id", ImageKind.BACKDROP, "revision"),),
            ImageVariant.POSTER_SMALL,
        )
