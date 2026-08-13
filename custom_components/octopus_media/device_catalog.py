"""Per-entry Jellyfin device catalog with bounded refresh behavior."""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass
from time import monotonic

from .api.jellyfin import JellyfinClient
from .api.jellyfin_types import JellyfinDevice
from .coordinators.base import error_code
from .exceptions import UnexpectedHTTPError

DEVICE_CATALOG_TTL_SECONDS = 300.0


@dataclass(frozen=True, slots=True)
class DeviceCatalogResult:
    """Internal catalog snapshot used during one playing normalization."""

    devices: Mapping[str, JellyfinDevice]
    stale: bool


class JellyfinDeviceCatalog:
    """Cache one complete Jellyfin device catalog per ConfigEntry."""

    def __init__(
        self,
        client: JellyfinClient,
        *,
        ttl_seconds: float = DEVICE_CATALOG_TTL_SECONDS,
        clock: Callable[[], float] = monotonic,
    ) -> None:
        self._client = client
        self._ttl_seconds = ttl_seconds
        self._clock = clock
        self._lock = asyncio.Lock()
        self._devices: dict[str, JellyfinDevice] = {}
        self._loaded_at: float | None = None
        self._expires_at = float("-inf")
        self._last_miss_refresh_at = float("-inf")
        self._last_error: str | None = None
        self._supported: bool | None = None
        self._last_matches = 0
        self._last_missing = 0
        self._requests = 0
        self._hits = 0
        self._miss_refreshes = 0

    async def async_get_for_device_ids(self, device_ids: Iterable[str]) -> DeviceCatalogResult:
        """Return exact-ID matches, refreshing at most once for a new miss."""
        requested = {value for value in device_ids if value}
        async with self._lock:
            now = self._clock()
            had_fresh_catalog = now < self._expires_at
            if had_fresh_catalog:
                self._hits += 1
            else:
                await self._async_refresh_locked(now)

            missing = requested.difference(self._devices)
            now = self._clock()
            if missing:
                if not had_fresh_catalog:
                    self._last_miss_refresh_at = now
                elif now - self._last_miss_refresh_at >= self._ttl_seconds:
                    self._last_miss_refresh_at = now
                    self._miss_refreshes += 1
                    await self._async_refresh_locked(now)

            self._last_matches = len(requested.intersection(self._devices))
            self._last_missing = len(requested.difference(self._devices))
            return DeviceCatalogResult(dict(self._devices), self._last_error is not None)

    def invalidate(self) -> None:
        """Expire the cache so the next playing refresh reloads the catalog."""
        self._expires_at = float("-inf")

    def diagnostics(self) -> dict[str, object]:
        """Return aggregate cache state without names or device identifiers."""
        now = self._clock()
        age = None if self._loaded_at is None else max(0, round(now - self._loaded_at))
        return {
            "enabled": True,
            "supported": self._supported,
            "ttl_seconds": round(self._ttl_seconds),
            "items": len(self._devices),
            "matches": self._last_matches,
            "missing": self._last_missing,
            "cache_valid": now < self._expires_at,
            "stale": self._last_error is not None,
            "age_seconds": age,
            "last_error": self._last_error,
            "requests": self._requests,
            "hits": self._hits,
            "miss_refreshes": self._miss_refreshes,
        }

    async def _async_refresh_locked(self, now: float) -> None:
        self._requests += 1
        try:
            devices = await self._client.async_get_devices()
        except asyncio.CancelledError:
            raise
        except Exception as err:
            self._last_error = error_code(err)
            if isinstance(err, UnexpectedHTTPError) and err.status in {404, 405, 501}:
                self._supported = False
            self._expires_at = now + self._ttl_seconds
            return
        self._devices = {device["Id"]: device for device in devices}
        self._loaded_at = now
        self._expires_at = now + self._ttl_seconds
        self._last_error = None
        self._supported = True
