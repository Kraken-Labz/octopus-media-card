"""Shared coordinator behavior for Jellyfin Phase 3A."""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from ..exceptions import (
    CannotConnectError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
    UnexpectedHTTPError,
)
from ..normalizers import NormalizedBatch

_LOGGER = logging.getLogger(__name__)


def error_code(error: BaseException | None) -> str:
    """Map safe client exceptions to the closed frontend error contract."""
    if isinstance(error, UpdateFailed) and str(error) in {
        "auth_failed",
        "timeout",
        "unreachable",
        "invalid_response",
        "unexpected_http",
        "unknown",
    }:
        return str(error)
    if isinstance(error, InvalidAuthenticationError):
        return "auth_failed"
    if isinstance(error, RequestTimeoutError):
        return "timeout"
    if isinstance(error, CannotConnectError):
        return "unreachable"
    if isinstance(error, InvalidResponseError):
        return "invalid_response"
    if isinstance(error, UnexpectedHTTPError):
        return "unexpected_http"
    return "unknown"


class JellyfinCoordinator[ItemT](DataUpdateCoordinator[NormalizedBatch[ItemT]]):
    """Base coordinator that preserves DataUpdateCoordinator's last valid data."""

    def __init__(
        self, hass: HomeAssistant, config_entry: ConfigEntry, name: str, interval: int
    ) -> None:
        """Initialize one shared poller for a config entry."""
        super().__init__(
            hass,
            logger=_LOGGER,
            config_entry=config_entry,
            name=name,
            update_interval=timedelta(seconds=interval),
        )

    @staticmethod
    def update_failed(error: Exception) -> UpdateFailed | ConfigEntryAuthFailed:
        """Create a closed, redaction-safe coordinator error."""
        if isinstance(error, InvalidAuthenticationError):
            return ConfigEntryAuthFailed("auth_failed")
        return UpdateFailed(error_code(error))
