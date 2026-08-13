"""Minimal collection-only fcntl shim for Home Assistant tests on Windows.

Home Assistant itself is supported on POSIX environments. Its pytest plugin imports
``homeassistant.runner`` during collection, which imports ``fcntl`` even though the
single-instance lock is not exercised by these component tests. This module is used
only when its directory is explicitly prepended to ``PYTHONPATH`` on Windows.
"""

LOCK_EX = 2
LOCK_NB = 4


def flock(file_descriptor: int, operation: int) -> None:
    """No-op for collection; never use this shim to run Home Assistant itself."""
