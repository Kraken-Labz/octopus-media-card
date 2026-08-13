"""Coordinator interfaces. Polling begins in Phase 3."""

from .playing import JellyfinPlayingCoordinator
from .recent import JellyfinRecentCoordinator
from .upcoming import UpcomingCoordinator

__all__ = ["JellyfinPlayingCoordinator", "JellyfinRecentCoordinator", "UpcomingCoordinator"]
