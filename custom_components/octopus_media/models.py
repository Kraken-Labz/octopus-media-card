"""Stable normalized models shared with the Octopus Media Card frontend."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any


class AvailabilityState(StrEnum):
    """Normalized availability states."""

    ONLINE = "online"
    OFFLINE = "offline"
    NOT_CONFIGURED = "not_configured"


class MediaSource(StrEnum):
    """Supported media sources."""

    JELLYFIN = "jellyfin"
    RADARR = "radarr"
    SONARR = "sonarr"


class MediaType(StrEnum):
    """Normalized media types."""

    MOVIE = "movie"
    SERIES = "series"
    EPISODE = "episode"


class PlayingState(StrEnum):
    """Normalized playback state."""

    PLAYING = "playing"
    PAUSED = "paused"


class RelativeDay(StrEnum):
    """Backend calendar classification."""

    TODAY = "today"
    TOMORROW = "tomorrow"
    FUTURE = "future"
    OVERDUE = "overdue"


class UpcomingState(StrEnum):
    """Truthful state of the combined Radarr/Sonarr section."""

    READY = "ready"
    EMPTY = "empty"
    PARTIAL = "partial"
    UNAVAILABLE = "unavailable"
    STALE = "stale"


@dataclass(frozen=True, slots=True)
class EntryCapabilities:
    """Modes supported by a config entry."""

    recent: bool
    upcoming: bool
    playing: bool

    def as_dict(self) -> dict[str, bool]:
        """Serialize capabilities."""
        return {
            "recent": self.recent,
            "upcoming": self.upcoming,
            "playing": self.playing,
        }


@dataclass(frozen=True, slots=True)
class ServiceAvailability:
    """Safe service availability visible to the card."""

    state: AvailabilityState
    last_success_at: str | None = None
    error: str | None = None

    def as_dict(self) -> dict[str, str | None]:
        """Serialize availability."""
        return {
            "state": self.state,
            "last_success_at": self.last_success_at,
            "error": self.error,
        }


@dataclass(frozen=True, slots=True)
class RecentItem:
    """Lightweight recent media item."""

    ref: str
    media_type: MediaType
    title: str
    subtitle: str | None
    year: int | None
    season: int | None
    episode: int | None
    episode_count: int
    added_at: str | None
    rating: float | None
    poster_ref: str | None
    still_ref: str | None
    backdrop_ref: str | None

    def as_dict(self) -> dict[str, Any]:
        """Serialize a recent item."""
        return {
            "ref": self.ref,
            "type": self.media_type,
            "title": self.title,
            "subtitle": self.subtitle,
            "year": self.year,
            "season": self.season,
            "episode": self.episode,
            "episode_count": self.episode_count,
            "added_at": self.added_at,
            "rating": self.rating,
            "poster_ref": self.poster_ref,
            "still_ref": self.still_ref,
            "backdrop_ref": self.backdrop_ref,
        }


@dataclass(frozen=True, slots=True)
class UpcomingItem:
    """Lightweight calendar item."""

    ref: str
    source: MediaSource
    media_type: MediaType
    title: str
    subtitle: str | None
    release_at: str
    monitored: bool
    downloaded: bool
    status: str | None
    relative_day: RelativeDay
    days_remaining: int
    poster_ref: str | None
    date_kind: str | None = None
    release_type: str | None = None
    year: int | None = None
    season_number: int | None = None
    episode_number: int | None = None
    episode_title: str | None = None
    image: dict[str, str | int] | None = None
    all_day: bool = False

    def as_dict(self) -> dict[str, Any]:
        """Serialize an upcoming item."""
        return {
            "ref": self.ref,
            "source": self.source,
            "type": self.media_type,
            "title": self.title,
            "subtitle": self.subtitle,
            "release_at": self.release_at,
            "event_date": self.release_at,
            "all_day": self.all_day,
            "date_kind": self.date_kind,
            "release_type": self.release_type,
            "year": self.year,
            "season_number": self.season_number,
            "episode_number": self.episode_number,
            "episode_title": self.episode_title,
            "image": self.image,
            "monitored": self.monitored,
            "downloaded": self.downloaded,
            "status": self.status,
            "relative_day": self.relative_day,
            "days_remaining": self.days_remaining,
            "poster_ref": self.poster_ref,
        }


@dataclass(frozen=True, slots=True)
class PlayingItem:
    """Lightweight active session."""

    ref: str
    device_name: str
    device_alias: str | None
    user_name: str
    state: PlayingState
    media_type: MediaType
    title: str
    subtitle: str | None
    genres: tuple[str, ...]
    rating: float | None
    video_resolution: str | None
    video_hdr: bool
    audio_channels: str | None
    position_seconds: int
    duration_seconds: int
    progress: float
    poster_ref: str | None
    still_ref: str | None
    backdrop_ref: str | None
    updated_at: str

    def as_dict(self) -> dict[str, Any]:
        """Serialize a playing item."""
        return {
            "ref": self.ref,
            "device_name": self.device_name,
            "device_alias": self.device_alias,
            "user_name": self.user_name,
            "state": self.state,
            "type": self.media_type,
            "title": self.title,
            "subtitle": self.subtitle,
            "genres": list(self.genres),
            "rating": self.rating,
            "video_resolution": self.video_resolution,
            "video_hdr": self.video_hdr,
            "audio_channels": self.audio_channels,
            "position_seconds": self.position_seconds,
            "duration_seconds": self.duration_seconds,
            "progress": self.progress,
            "poster_ref": self.poster_ref,
            "still_ref": self.still_ref,
            "backdrop_ref": self.backdrop_ref,
            "updated_at": self.updated_at,
        }


@dataclass(frozen=True, slots=True)
class SectionSnapshot[ItemT: (RecentItem, UpcomingItem, PlayingItem)]:
    """A versioned collection for one mode."""

    revision: int
    updated_at: str
    stale: bool
    partial: bool
    items: tuple[ItemT, ...]
    state: UpcomingState | None = None

    def as_dict(self) -> dict[str, Any]:
        """Serialize a section."""
        return {
            "revision": self.revision,
            "updated_at": self.updated_at,
            "stale": self.stale,
            "partial": self.partial,
            "items": [item.as_dict() for item in self.items],
            "state": self.state,
        }


@dataclass(frozen=True, slots=True)
class DashboardSnapshot:
    """Complete normalized snapshot delivered to the frontend."""

    schema_version: int
    entry_id: str
    revision: int
    updated_at: str
    time_zone: str
    availability: dict[MediaSource, ServiceAvailability]
    recent: SectionSnapshot[RecentItem]
    upcoming: SectionSnapshot[UpcomingItem]
    playing: SectionSnapshot[PlayingItem]

    def as_dict(self) -> dict[str, Any]:
        """Serialize the snapshot without leaking backend objects."""
        return {
            "schema_version": self.schema_version,
            "entry_id": self.entry_id,
            "revision": self.revision,
            "updated_at": self.updated_at,
            "time_zone": self.time_zone,
            "availability": {
                source: availability.as_dict() for source, availability in self.availability.items()
            },
            "recent": self.recent.as_dict(),
            "upcoming": self.upcoming.as_dict(),
            "playing": self.playing.as_dict(),
        }


def utc_now_iso() -> str:
    """Return a UTC ISO 8601 timestamp for scaffold snapshots."""
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def build_empty_snapshot(entry_id: str, time_zone: str) -> DashboardSnapshot:
    """Build a truthful empty scaffold snapshot with no fake media."""
    timestamp = utc_now_iso()
    availability = {
        source: ServiceAvailability(AvailabilityState.NOT_CONFIGURED) for source in MediaSource
    }
    return DashboardSnapshot(
        schema_version=1,
        entry_id=entry_id,
        revision=0,
        updated_at=timestamp,
        time_zone=time_zone,
        availability=availability,
        recent=SectionSnapshot(0, timestamp, False, False, ()),
        upcoming=SectionSnapshot(0, timestamp, False, False, ()),
        playing=SectionSnapshot(0, timestamp, False, False, ()),
    )
