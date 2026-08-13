"""External service client interfaces. Real clients begin in Phase 3."""

from .jellyfin import JellyfinClient
from .radarr import RadarrClient
from .sonarr import SonarrClient

__all__ = ["JellyfinClient", "RadarrClient", "SonarrClient"]
