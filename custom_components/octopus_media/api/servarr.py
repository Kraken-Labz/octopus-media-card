"""Small, backend-only clients for Radarr and Sonarr."""

from __future__ import annotations

import asyncio
from collections.abc import Mapping
from typing import Any

import aiohttp

from ..exceptions import (
    CannotConnectError,
    InvalidAuthenticationError,
    InvalidResponseError,
    RequestTimeoutError,
    UnexpectedHTTPError,
)
from .base import BaseMediaClient


class ServarrClient(BaseMediaClient):
    """Common authenticated JSON transport for Radarr/Sonarr v3 APIs."""

    service_name = "servarr"
    product_name = "Servarr"

    async def async_validate(self) -> dict[str, Any]:
        """Validate credentials and return only a safe status subset."""
        payload = await self._async_get_json("system/status")
        data = self._require_mapping(payload)
        version = data.get("version")
        app_name = data.get("appName")
        if not isinstance(version, str) or not version.strip():
            raise InvalidResponseError("Servarr status version is invalid")
        if not isinstance(app_name, str) or app_name.casefold() != self.product_name.casefold():
            raise InvalidResponseError("Servarr status identifies an unexpected service")
        return {"version": version}

    async def _async_get_json(self, path: str) -> Any:
        url = f"{self._config.url.rstrip('/')}/api/v3/{path.lstrip('/')}"
        headers = {"Accept": "application/json", "X-Api-Key": self._config.api_key}
        timeout = aiohttp.ClientTimeout(total=self._config.timeout)
        try:
            async with self._session.get(
                url,
                headers=headers,
                ssl=self._config.verify_ssl,
                timeout=timeout,
            ) as response:
                if response.status in (401, 403):
                    raise InvalidAuthenticationError("Servarr rejected the configured credential")
                if not 200 <= response.status < 300:
                    raise UnexpectedHTTPError(response.status)
                try:
                    return await response.json(content_type=None)
                except (aiohttp.ContentTypeError, ValueError, UnicodeDecodeError) as err:
                    raise InvalidResponseError("Servarr returned invalid JSON") from err
        except asyncio.CancelledError:
            raise
        except (InvalidAuthenticationError, InvalidResponseError, UnexpectedHTTPError):
            raise
        except TimeoutError as err:
            raise RequestTimeoutError("Servarr request timed out") from err
        except aiohttp.ClientError as err:
            raise CannotConnectError("Servarr service is unreachable") from err

    @staticmethod
    def _require_mapping(value: object) -> dict[str, Any]:
        if not isinstance(value, Mapping):
            raise InvalidResponseError("Servarr response must be an object")
        return dict(value)


class RadarrClient(ServarrClient):
    """Radarr v3 movie client."""

    service_name = "radarr"
    product_name = "Radarr"

    async def async_get_movies(self) -> list[dict[str, Any]]:
        payload = await self._async_get_json("movie")
        if not isinstance(payload, list):
            raise InvalidResponseError("Radarr movie response must be an array")
        return [self._require_mapping(item) for item in payload]


class SonarrClient(ServarrClient):
    """Sonarr v3 episode client."""

    service_name = "sonarr"
    product_name = "Sonarr"

    async def async_get_episodes(self) -> list[dict[str, Any]]:
        payload = await self._async_get_json("episode")
        if not isinstance(payload, list):
            raise InvalidResponseError("Sonarr episode response must be an array")
        return [self._require_mapping(item) for item in payload]
