"""Shared configuration for asynchronous media service clients."""

from __future__ import annotations

from dataclasses import dataclass

from aiohttp import ClientSession

from ..exceptions import ClientNotImplementedError


@dataclass(frozen=True, slots=True)
class APIClientConfig:
    """Backend-only service configuration."""

    url: str
    api_key: str
    verify_ssl: bool = True
    timeout: float = 10.0


class BaseMediaClient:
    """Base class that stores an injected Home Assistant HTTP session."""

    def __init__(self, session: ClientSession, config: APIClientConfig) -> None:
        """Store injected dependencies without contacting a service."""
        self._session = session
        self._config = config

    async def async_validate(self) -> object:
        """Validate a concrete service implementation."""
        raise ClientNotImplementedError("External clients are Phase 3 work")
