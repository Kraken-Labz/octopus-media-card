"""Minimal collection-only resource shim for Home Assistant tests on Windows."""

RLIMIT_NOFILE = 7


def getrlimit(resource_id: int) -> tuple[int, int]:
    """Return a harmless high descriptor limit for collection-only imports."""
    return (8192, 8192)


def setrlimit(resource_id: int, limits: tuple[int, int]) -> None:
    """No-op; never use this shim to run Home Assistant itself."""
