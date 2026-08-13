"""Normalize Jellyfin DTO subsets into safe frontend models."""

from __future__ import annotations

import base64
import hashlib
import hmac
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from ..api.jellyfin_types import (
    JellyfinDevice,
    JellyfinMediaItem,
    JellyfinMediaStream,
    JellyfinPlayState,
    JellyfinSession,
)
from ..image_store import (
    ImageCandidate,
    ImageDescriptor,
    ImageKind,
    ImageReferenceStore,
    ImageVariant,
)
from ..models import MediaSource, MediaType, PlayingItem, PlayingState, RecentItem, utc_now_iso

TICKS_PER_SECOND = 10_000_000


@dataclass(frozen=True, slots=True)
class NormalizedBatch[ItemT]:
    """Normalized items plus a safe partial-response marker."""

    items: tuple[ItemT, ...]
    partial: bool = False


def derive_media_reference(secret: str, category: str, internal_id: str) -> str:
    """Derive a stable HMAC reference without exposing a Jellyfin ID."""
    digest = hmac.new(
        secret.encode(), f"jellyfin\x1f{category}\x1f{internal_id}".encode(), hashlib.sha256
    ).digest()[:24]
    encoded = base64.urlsafe_b64encode(digest).decode().rstrip("=")
    return f"media_{encoded}"


def normalize_recent_items(
    raw_items: list[JellyfinMediaItem],
    *,
    secret: str,
    image_store: ImageReferenceStore,
    group_episodes: bool,
    limit: int,
) -> NormalizedBatch[RecentItem]:
    """Normalize movies/episodes, optionally grouping episodes by series."""
    normalized: list[RecentItem] = []
    partial = False
    for raw in raw_items:
        item = _normalize_recent_item(raw, secret=secret, image_store=image_store)
        if item is None:
            partial = True
            continue
        normalized.append(item)

    normalized.sort(key=lambda item: (_date_sort_key(item.added_at), item.ref), reverse=True)
    if group_episodes:
        normalized = _group_recent_episodes(normalized, raw_items, secret)
        normalized.sort(key=lambda item: (_date_sort_key(item.added_at), item.ref), reverse=True)
    return NormalizedBatch(tuple(normalized[: max(1, limit)]), partial)


def normalize_sessions(
    raw_sessions: list[JellyfinSession],
    *,
    secret: str,
    image_store: ImageReferenceStore,
    devices: dict[str, JellyfinDevice],
) -> NormalizedBatch[PlayingItem]:
    """Normalize playing/paused sessions and ignore idle or unsupported media."""
    items: list[PlayingItem] = []
    partial = False
    received_at = utc_now_iso()
    for raw in raw_sessions:
        item = _normalize_session(
            raw,
            secret=secret,
            image_store=image_store,
            devices=devices,
            received_at=received_at,
        )
        if item is None:
            if raw.get("NowPlayingItem") is not None:
                partial = True
            continue
        items.append(item)
    items.sort(
        key=lambda item: (
            item.device_alias or item.device_name,
            item.user_name,
            item.title,
            item.ref,
        )
    )
    return NormalizedBatch(tuple(items), partial)


def _normalize_recent_item(
    raw: JellyfinMediaItem, *, secret: str, image_store: ImageReferenceStore
) -> RecentItem | None:
    internal_id = _string(raw.get("Id"))
    name = _string(raw.get("Name"))
    raw_type = _string(raw.get("Type"))
    if internal_id is None or name is None or raw_type not in ("Movie", "Episode"):
        return None
    poster_ref, still_ref, backdrop_ref = _register_images(
        raw, image_store, episode=raw_type == "Episode"
    )
    if raw_type == "Movie":
        title = name
        subtitle = None
        media_type = MediaType.MOVIE
        season = episode = None
    else:
        title = _string(raw.get("SeriesName")) or name
        season = _integer(raw.get("ParentIndexNumber"))
        episode = _integer(raw.get("IndexNumber"))
        subtitle = _episode_subtitle(season, episode, name)
        media_type = MediaType.EPISODE
    return RecentItem(
        ref=derive_media_reference(secret, "recent", internal_id),
        media_type=media_type,
        title=title,
        subtitle=subtitle,
        year=_integer(raw.get("ProductionYear")),
        season=season,
        episode=episode,
        episode_count=1 if media_type is MediaType.EPISODE else 0,
        added_at=_utc_iso(raw.get("DateCreated")),
        rating=_number(raw.get("CommunityRating")),
        poster_ref=poster_ref,
        still_ref=still_ref,
        backdrop_ref=backdrop_ref,
    )


def _group_recent_episodes(
    items: list[RecentItem], raw_items: list[JellyfinMediaItem], secret: str
) -> list[RecentItem]:
    series_keys: dict[str, str] = {}
    for raw in raw_items:
        internal_id = _string(raw.get("Id"))
        if internal_id:
            series_keys[derive_media_reference(secret, "recent", internal_id)] = (
                _string(raw.get("SeriesId")) or _string(raw.get("SeriesName")) or internal_id
            )
    grouped: dict[str, RecentItem] = {}
    output: list[RecentItem] = []
    for item in items:
        if item.media_type is not MediaType.EPISODE:
            output.append(item)
            continue
        key = series_keys.get(item.ref, item.title.casefold())
        existing = grouped.get(key)
        if existing is None:
            grouped[key] = RecentItem(
                ref=derive_media_reference(secret, "series", key),
                media_type=MediaType.SERIES,
                title=item.title,
                subtitle=item.subtitle,
                year=item.year,
                season=item.season,
                episode=item.episode,
                episode_count=1,
                added_at=item.added_at,
                rating=item.rating,
                poster_ref=item.poster_ref,
                still_ref=item.still_ref,
                backdrop_ref=item.backdrop_ref,
            )
        else:
            grouped[key] = RecentItem(
                ref=existing.ref,
                media_type=existing.media_type,
                title=existing.title,
                subtitle=existing.subtitle,
                year=existing.year,
                season=existing.season,
                episode=existing.episode,
                episode_count=existing.episode_count + 1,
                added_at=existing.added_at,
                rating=existing.rating,
                poster_ref=existing.poster_ref,
                still_ref=existing.still_ref,
                backdrop_ref=existing.backdrop_ref,
            )
    output.extend(grouped.values())
    return output


def _normalize_session(
    raw: JellyfinSession,
    *,
    secret: str,
    image_store: ImageReferenceStore,
    devices: dict[str, JellyfinDevice],
    received_at: str,
) -> PlayingItem | None:
    media = raw.get("NowPlayingItem")
    play_state = raw.get("PlayState")
    if not isinstance(media, dict) or not isinstance(play_state, dict):
        return None
    internal_media_id = _string(media.get("Id"))
    name = _string(media.get("Name"))
    raw_type = _string(media.get("Type"))
    if internal_media_id is None or name is None or raw_type not in ("Movie", "Episode"):
        return None
    session_key = (
        _string(raw.get("Id"))
        or _string(raw.get("DeviceId"))
        or f"{_string(raw.get('DeviceName')) or 'device'}:{internal_media_id}"
    )
    device_id = _string(raw.get("DeviceId"))
    catalog_device = devices.get(device_id) if device_id is not None else None
    device_name = _string(catalog_device.get("CustomName")) if catalog_device is not None else None
    device_name = (
        device_name
        or _string(raw.get("DeviceName"))
        or _string(raw.get("Client"))
        or "Dispositivo Jellyfin"
    )
    user_name = _string(raw.get("UserName")) or "Jellyfin"
    position = max(0, _ticks_to_seconds(play_state.get("PositionTicks")))
    duration = max(0, _ticks_to_seconds(media.get("RunTimeTicks")))
    progress = min(100.0, max(0.0, position / duration * 100.0)) if duration else 0.0
    subtitle: str | None
    if raw_type == "Episode":
        season = _integer(media.get("ParentIndexNumber"))
        episode = _integer(media.get("IndexNumber"))
        title = _string(media.get("SeriesName")) or name
        subtitle = _episode_subtitle(season, episode, name)
        media_type = MediaType.EPISODE
    else:
        title = name
        year = _integer(media.get("ProductionYear"))
        subtitle = str(year) if year is not None else None
        media_type = MediaType.MOVIE
    poster_ref, still_ref, backdrop_ref = _register_images(
        media, image_store, episode=raw_type == "Episode"
    )
    genres = tuple(
        genre for value in (media.get("Genres") or []) if (genre := _string(value)) is not None
    )[:2]
    video_resolution, video_hdr, audio_channels = _technical_metadata(media, play_state)
    return PlayingItem(
        ref=derive_media_reference(secret, "session", session_key),
        device_name=device_name,
        device_alias=None,
        user_name=user_name,
        state=PlayingState.PAUSED if bool(play_state.get("IsPaused")) else PlayingState.PLAYING,
        media_type=media_type,
        title=title,
        subtitle=subtitle,
        genres=genres,
        rating=_number(media.get("CommunityRating")),
        video_resolution=video_resolution,
        video_hdr=video_hdr,
        audio_channels=audio_channels,
        position_seconds=position,
        duration_seconds=duration,
        progress=progress,
        poster_ref=poster_ref,
        still_ref=still_ref,
        backdrop_ref=backdrop_ref,
        updated_at=_utc_iso(raw.get("LastActivityDate")) or received_at,
    )


def _technical_metadata(
    media: JellyfinMediaItem, play_state: JellyfinPlayState
) -> tuple[str | None, bool, str | None]:
    streams = media.get("MediaStreams")
    if not isinstance(streams, list):
        return None, False, None
    video = _selected_stream(streams, "Video", _integer(play_state.get("VideoStreamIndex")))
    audio = _selected_stream(streams, "Audio", _integer(play_state.get("AudioStreamIndex")))
    return _video_resolution(video), _video_is_hdr(video), _audio_channel_label(audio)


def _selected_stream(
    streams: list[JellyfinMediaStream], stream_type: str, selected_index: int | None
) -> JellyfinMediaStream | None:
    candidates = [stream for stream in streams if _string(stream.get("Type")) == stream_type]
    if selected_index is not None:
        selected = next(
            (stream for stream in candidates if _integer(stream.get("Index")) == selected_index),
            None,
        )
        if selected is not None:
            return selected
    return candidates[0] if candidates else None


def _video_resolution(stream: JellyfinMediaStream | None) -> str | None:
    if stream is None:
        return None
    width = _integer(stream.get("Width")) or 0
    height = _integer(stream.get("Height")) or 0
    if width >= 3800 or height >= 2100:
        return "4K"
    if height >= 1400:
        return "1440p"
    if height >= 1000:
        return "1080p"
    if height >= 700:
        return "720p"
    return None


def _video_is_hdr(stream: JellyfinMediaStream | None) -> bool:
    if stream is None:
        return False
    signals = (
        _string(stream.get("VideoRange")),
        _string(stream.get("VideoRangeType")),
    )
    normalized = tuple(
        signal.upper().replace(" ", "").replace("-", "") for signal in signals if signal
    )
    return any(
        marker in signal
        for signal in normalized
        for marker in ("HDR", "DOVI", "DOLBYVISION", "HLG", "PQ")
    )


def _audio_channel_label(stream: JellyfinMediaStream | None) -> str | None:
    if stream is None:
        return None
    channels = _integer(stream.get("Channels"))
    if channels == 1:
        return "1.0"
    if channels == 2:
        return "2.0"
    if channels == 6:
        return "5.1"
    if channels == 8:
        return "7.1"
    return None


def _register_images(
    item: JellyfinMediaItem,
    image_store: ImageReferenceStore,
    *,
    episode: bool,
) -> tuple[str | None, str | None, str | None]:
    internal_id = _string(item.get("Id"))
    if internal_id is None:
        return None, None, None
    image_tags = item.get("ImageTags")
    primary_tag = _string(image_tags.get("Primary")) if isinstance(image_tags, dict) else None
    series_id = _string(item.get("SeriesId"))
    series_tag = _string(item.get("SeriesPrimaryImageTag"))
    season_id = _string(item.get("ParentPrimaryImageItemId"))
    season_tag = _string(item.get("ParentPrimaryImageTag"))
    own_candidate = (
        ImageCandidate(internal_id, ImageKind.PRIMARY, primary_tag) if primary_tag else None
    )
    series_candidate = (
        ImageCandidate(series_id, ImageKind.PRIMARY, series_tag)
        if series_id and series_tag
        else None
    )
    season_candidate = (
        ImageCandidate(season_id, ImageKind.PRIMARY, season_tag)
        if season_id and season_tag
        else None
    )
    # Poster layouts use only known vertical artwork. The episode Primary is registered
    # separately as a still for horizontal hero/detail contexts.
    ordered_candidates = (series_candidate, season_candidate) if episode else (own_candidate,)
    poster_candidates = tuple(
        candidate for candidate in ordered_candidates if candidate is not None
    )
    poster_ref = None
    if poster_candidates:
        poster_ref = image_store.register(
            ImageDescriptor(
                config_entry_id=image_store.config_entry_id,
                source=MediaSource.JELLYFIN,
                server_id=image_store.server_id,
                candidates=poster_candidates,
                allowed_variants=(
                    ImageVariant.POSTER_SMALL,
                    ImageVariant.POSTER_MEDIUM,
                    ImageVariant.POSTER_LARGE,
                ),
            )
        )
    still_ref = None
    if episode and own_candidate is not None:
        still_ref = image_store.register(
            ImageDescriptor(
                config_entry_id=image_store.config_entry_id,
                source=MediaSource.JELLYFIN,
                server_id=image_store.server_id,
                candidates=(own_candidate,),
                allowed_variants=(
                    ImageVariant.POSTER_MEDIUM,
                    ImageVariant.POSTER_LARGE,
                ),
            )
        )
    backdrop_tags = item.get("BackdropImageTags")
    backdrop_tag = (
        _string(backdrop_tags[0]) if isinstance(backdrop_tags, list) and backdrop_tags else None
    )
    backdrop_ref = None
    parent_backdrop_tags = item.get("ParentBackdropImageTags")
    parent_backdrop_tag = (
        _string(parent_backdrop_tags[0])
        if isinstance(parent_backdrop_tags, list) and parent_backdrop_tags
        else None
    )
    parent_backdrop_id = _string(item.get("ParentBackdropItemId"))
    backdrop_candidates = tuple(
        candidate
        for candidate in (
            ImageCandidate(internal_id, ImageKind.BACKDROP, backdrop_tag) if backdrop_tag else None,
            ImageCandidate(parent_backdrop_id, ImageKind.BACKDROP, parent_backdrop_tag)
            if parent_backdrop_id and parent_backdrop_tag
            else None,
        )
        if candidate is not None
    )
    if backdrop_candidates:
        backdrop_ref = image_store.register(
            ImageDescriptor(
                config_entry_id=image_store.config_entry_id,
                source=MediaSource.JELLYFIN,
                server_id=image_store.server_id,
                candidates=backdrop_candidates,
                allowed_variants=(ImageVariant.BACKDROP_SMALL, ImageVariant.BACKDROP_MEDIUM),
            )
        )
    return poster_ref, still_ref, backdrop_ref


def _episode_subtitle(season: int | None, episode: int | None, name: str) -> str:
    code = ""
    if season is not None and episode is not None:
        code = f"T{season:02d}E{episode:02d}"
    elif episode is not None:
        code = f"E{episode:02d}"
    return f"{code} · {name}" if code else name


def _utc_iso(value: object) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _date_sort_key(value: str | None) -> float:
    if value is None:
        return float("-inf")
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return float("-inf")


def _string(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _integer(value: object) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _number(value: object) -> float | None:
    return float(value) if isinstance(value, int | float) and not isinstance(value, bool) else None


def _ticks_to_seconds(value: Any) -> int:
    return max(0, value // TICKS_PER_SECOND) if isinstance(value, int) else 0
