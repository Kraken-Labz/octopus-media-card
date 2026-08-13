"""Shared Home Assistant fixtures."""

import socket
import sys

import pytest

if sys.platform == "win32":
    _real_socket = socket.socket
    _real_socketpair = socket.socketpair

    def _windows_internal_socketpair(
        family: int = socket.AF_INET,
        type: int = socket.SOCK_STREAM,
        proto: int = 0,
    ) -> tuple[socket.socket, socket.socket]:
        """Create only the private asyncio wakeup pair despite pytest-socket."""
        guarded_socket = socket.socket
        socket.socket = _real_socket  # type: ignore[misc]
        try:
            return _real_socketpair(family, type, proto)
        finally:
            socket.socket = guarded_socket  # type: ignore[misc]

    socket.socketpair = _windows_internal_socketpair


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Allow Home Assistant to discover the local custom integration."""
