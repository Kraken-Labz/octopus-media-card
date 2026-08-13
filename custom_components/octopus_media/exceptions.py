"""Typed exceptions for Octopus Media Card."""


class OctopusMediaError(Exception):
    """Base error for the integration."""


class ClientNotImplementedError(OctopusMediaError):
    """Raised when a Phase 3 API operation is invoked during the scaffold."""


class CannotConnectError(OctopusMediaError):
    """Raised when a configured service cannot be reached."""


class InvalidAuthenticationError(OctopusMediaError):
    """Raised when a configured service rejects its credentials."""


class InvalidResponseError(OctopusMediaError):
    """Raised when a service response cannot be normalized safely."""


class UnsupportedVersionError(OctopusMediaError):
    """Raised when a service version is not supported."""


class UnknownImageReferenceError(OctopusMediaError):
    """Raised when an opaque image reference is not registered."""


class InvalidImageVariantError(OctopusMediaError):
    """Raised when an image variant is outside the closed allowlist."""


class ImageNotFoundError(OctopusMediaError):
    """Raised when every registered fallback image is absent."""


class ImagePayloadError(OctopusMediaError):
    """Raised when an image response fails bounded validation."""


class ImageTemporaryError(OctopusMediaError):
    """Raised for a sanitized temporary image delivery failure."""


class RequestTimeoutError(OctopusMediaError):
    """Raised when a service request exceeds the configured timeout."""


class UnexpectedHTTPError(OctopusMediaError):
    """Raised for an unexpected HTTP status without exposing request details."""

    def __init__(self, status: int) -> None:
        """Store only the safe numeric status."""
        self.status = status
        super().__init__(f"Service returned unexpected HTTP status {status}")
