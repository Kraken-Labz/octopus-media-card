"""Typed opaque image descriptors and their per-entry registry."""

from __future__ import annotations

import base64
import hashlib
import hmac
import re
from collections import OrderedDict
from dataclasses import dataclass
from enum import StrEnum
from urllib.parse import urlsplit

from .exceptions import InvalidImageVariantError, UnknownImageReferenceError
from .models import MediaSource

_REFERENCE_PATTERN = re.compile(r"^image_[A-Za-z0-9_-]{32}$")
_IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,128}$")


class ImageKind(StrEnum):
    """Jellyfin image types allowed by the integration."""

    PRIMARY = "Primary"
    BACKDROP = "Backdrop"

    # Compatibility alias for Phase 3A callers and fixtures.
    POSTER = "Primary"


class ImageVariant(StrEnum):
    """Closed public variant allowlist."""

    POSTER_SMALL = "poster-small"
    POSTER_MEDIUM = "poster-medium"
    POSTER_LARGE = "poster-large"
    BACKDROP_SMALL = "backdrop-small"
    BACKDROP_MEDIUM = "backdrop-medium"

    # Compatibility alias for the single Phase 3A backdrop variant.
    BACKDROP = "backdrop-medium"


@dataclass(frozen=True, slots=True)
class ImageVariantSpec:
    """Backend-owned Jellyfin transformation parameters."""

    kind: ImageKind
    max_width: int
    quality: int = 90


IMAGE_VARIANT_SPECS: dict[ImageVariant, ImageVariantSpec] = {
    ImageVariant.POSTER_SMALL: ImageVariantSpec(ImageKind.PRIMARY, 160),
    ImageVariant.POSTER_MEDIUM: ImageVariantSpec(ImageKind.PRIMARY, 300),
    ImageVariant.POSTER_LARGE: ImageVariantSpec(ImageKind.PRIMARY, 500),
    ImageVariant.BACKDROP_SMALL: ImageVariantSpec(ImageKind.BACKDROP, 640),
    ImageVariant.BACKDROP_MEDIUM: ImageVariantSpec(ImageKind.BACKDROP, 1280),
}


@dataclass(frozen=True, slots=True)
class ImageCandidate:
    """One backend-only Jellyfin image in an ordered fallback chain."""

    internal_media_id: str
    kind: ImageKind
    revision: str
    image_index: int = 0
    origin_url: str | None = None

    def __post_init__(self) -> None:
        """Reject paths, URLs and unbounded indexes before registration."""
        if not _IDENTIFIER_PATTERN.fullmatch(self.internal_media_id):
            raise ValueError("internal_media_id must be an opaque service identifier")
        if not self.revision or len(self.revision) > 256:
            raise ValueError("revision must be a bounded non-empty value")
        if self.image_index != 0:
            raise ValueError("only image index zero is supported")
        if self.origin_url is not None:
            parsed = urlsplit(self.origin_url)
            if (
                parsed.scheme != "https"
                or not parsed.hostname
                or parsed.username
                or parsed.password
            ):
                raise ValueError("origin_url must be an HTTPS URL without credentials")


@dataclass(frozen=True, slots=True, init=False)
class ImageDescriptor:
    """Backend-only ConfigEntry-bound image lookup descriptor."""

    config_entry_id: str
    source: MediaSource
    server_id: str
    candidates: tuple[ImageCandidate, ...]
    allowed_variants: tuple[ImageVariant, ...]

    def __init__(
        self,
        *,
        source: MediaSource,
        allowed_variants: tuple[ImageVariant, ...],
        config_entry_id: str = "fixture_entry",
        server_id: str = "fixture_server",
        candidates: tuple[ImageCandidate, ...] | None = None,
        internal_media_id: str | None = None,
        kind: ImageKind | None = None,
        revision: str | None = None,
    ) -> None:
        """Build a descriptor; legacy scalar arguments remain test-compatible."""
        if candidates is None:
            if internal_media_id is None or kind is None or revision is None:
                raise ValueError("an image candidate is required")
            candidates = (ImageCandidate(internal_media_id, kind, revision),)
        if not _IDENTIFIER_PATTERN.fullmatch(config_entry_id):
            raise ValueError("config_entry_id must be opaque")
        if not _IDENTIFIER_PATTERN.fullmatch(server_id):
            raise ValueError("server_id must be opaque")
        if not candidates or len(candidates) > 3:
            raise ValueError("one to three fallback candidates are required")
        if not allowed_variants:
            raise ValueError("at least one image variant is required")
        candidate_kind = candidates[0].kind
        if any(candidate.kind is not candidate_kind for candidate in candidates):
            raise ValueError("fallback candidates must share one image type")
        if any(
            IMAGE_VARIANT_SPECS[variant].kind is not candidate_kind for variant in allowed_variants
        ):
            raise ValueError("variant does not match candidate image type")
        object.__setattr__(self, "config_entry_id", config_entry_id)
        object.__setattr__(self, "source", source)
        object.__setattr__(self, "server_id", server_id)
        object.__setattr__(self, "candidates", candidates)
        object.__setattr__(self, "allowed_variants", allowed_variants)

    @property
    def internal_media_id(self) -> str:
        """Compatibility accessor for the first candidate."""
        return self.candidates[0].internal_media_id

    @property
    def kind(self) -> ImageKind:
        """Return the common kind in the fallback chain."""
        return self.candidates[0].kind

    @property
    def revision(self) -> str:
        """Compatibility accessor for the first candidate revision."""
        return self.candidates[0].revision


def derive_image_reference(secret: str, descriptor: ImageDescriptor) -> str:
    """Create a deterministic opaque reference for all relevant lookup state."""
    parts = [
        descriptor.config_entry_id,
        descriptor.source,
        descriptor.server_id,
        *(
            f"{item.internal_media_id}:{item.kind}:{item.revision}:{item.image_index}"
            f":{item.origin_url or ''}"
            for item in descriptor.candidates
        ),
        *(variant.value for variant in descriptor.allowed_variants),
    ]
    digest = hmac.new(secret.encode(), "\x1f".join(parts).encode(), hashlib.sha256).digest()[:24]
    encoded = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return f"image_{encoded}"


def is_opaque_image_reference(value: str) -> bool:
    """Return whether a value has the closed opaque reference shape."""
    return _REFERENCE_PATTERN.fullmatch(value) is not None


class ImageReferenceStore:
    """Per-entry runtime registry of non-serializable descriptors."""

    def __init__(
        self,
        secret: str,
        config_entry_id: str = "fixture_entry",
        server_id: str = "fixture_server",
        max_descriptors: int = 1024,
    ) -> None:
        self._secret = secret
        if not _IDENTIFIER_PATTERN.fullmatch(config_entry_id):
            raise ValueError("config_entry_id must be opaque")
        if not _IDENTIFIER_PATTERN.fullmatch(server_id):
            raise ValueError("server_id must be opaque")
        if max_descriptors < 1:
            raise ValueError("max_descriptors must be positive")
        self.config_entry_id = config_entry_id
        self.server_id = server_id
        self._max_descriptors = max_descriptors
        self._descriptors: OrderedDict[str, ImageDescriptor] = OrderedDict()

    def register(self, descriptor: ImageDescriptor) -> str:
        if (
            descriptor.config_entry_id != self.config_entry_id
            or descriptor.server_id != self.server_id
        ):
            raise ValueError("image descriptor belongs to another runtime")
        reference = derive_image_reference(self._secret, descriptor)
        self._descriptors[reference] = descriptor
        self._descriptors.move_to_end(reference)
        while len(self._descriptors) > self._max_descriptors:
            self._descriptors.popitem(last=False)
        return reference

    def resolve(self, reference: str, variant: str) -> ImageDescriptor:
        """Resolve a known reference after validating its closed variant."""
        descriptor, _ = self.resolve_request(reference, variant)
        return descriptor

    def resolve_request(self, reference: str, variant: str) -> tuple[ImageDescriptor, ImageVariant]:
        """Resolve a descriptor together with its parsed variant."""
        if not is_opaque_image_reference(reference):
            raise UnknownImageReferenceError
        descriptor = self._descriptors.get(reference)
        if descriptor is None:
            raise UnknownImageReferenceError
        self._descriptors.move_to_end(reference)
        try:
            parsed_variant = ImageVariant(variant)
        except ValueError as err:
            raise InvalidImageVariantError from err
        if parsed_variant not in descriptor.allowed_variants:
            raise InvalidImageVariantError
        return descriptor, parsed_variant

    def clear(self) -> None:
        self._descriptors.clear()
