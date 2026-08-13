"""Pure, conservative Radarr/Sonarr Upcoming normalization."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from datetime import UTC, date, datetime, tzinfo
from typing import Any

from ..image_store import (
    ImageCandidate,
    ImageDescriptor,
    ImageKind,
    ImageReferenceStore,
    ImageVariant,
)
from ..models import MediaSource, MediaType, RelativeDay, UpcomingItem
from .jellyfin import NormalizedBatch

_LOGGER = logging.getLogger(__name__)


def normalize_radarr(
    raw_movies: list[dict[str, Any]] | Mapping[str, dict[str, Any]],
    *,
    calendar_events: list[dict[str, Any]] | None = None,
    now: datetime | None = None,
    timezone: tzinfo = UTC,
    image_store: ImageReferenceStore | None = None,
) -> NormalizedBatch[UpcomingItem]:
    """Correlate monitored Radarr movies with future all-day calendar events."""
    reference = _as_utc(now or datetime.now(UTC))
    movies = (
        raw_movies
        if isinstance(raw_movies, Mapping)
        else {str(i): movie for i, movie in enumerate(raw_movies)}
    )
    items: list[UpcomingItem] = []
    partial = False
    for event in calendar_events or []:
        summary = event.get("summary")
        raw = movies.get(summary) if isinstance(summary, str) else None
        if raw is None or raw.get("monitored") is not True:
            if isinstance(summary, str) and summary not in movies:
                _LOGGER.warning("Radarr calendar summary did not match a movie key: %s", summary)
            continue
        internal_id = _string(raw.get("id")) or _integer_string(raw.get("id"))
        title = _string(raw.get("title"))
        if internal_id is None or title is None:
            partial = True
            continue
        event_date = _event_date(event, timezone)
        if event_date is None or _event_is_past(event_date, reference):
            continue
        release_at, all_day = event_date
        poster_ref = _register_radarr_poster(raw, image_store, internal_id)
        items.append(
            UpcomingItem(
                ref=f"radarr:{internal_id}",
                source=MediaSource.RADARR,
                media_type=MediaType.MOVIE,
                title=title,
                subtitle=None,
                release_at=release_at,
                monitored=True,
                downloaded=bool(raw.get("has_file", raw.get("hasFile"))),
                status=_string(raw.get("status")),
                release_type=_string(raw.get("release_type")),
                relative_day=RelativeDay.FUTURE,
                days_remaining=max(0, (_date_only(release_at) - reference.date()).days),
                poster_ref=poster_ref,
                date_kind="release",
                year=_integer(raw.get("year")),
                image=(
                    {"source": "radarr", "item_id": int(internal_id), "kind": "poster"}
                    if isinstance(raw.get("images"), dict) and raw["images"].get("poster")
                    else None
                ),
                all_day=all_day,
            )
        )
    return NormalizedBatch(tuple(sorted(items, key=_sort_key)), partial)


def _register_radarr_poster(
    raw: Mapping[str, Any], image_store: ImageReferenceStore | None, internal_id: str
) -> str | None:
    """Register a provider-supplied poster behind the existing signed image path."""
    if image_store is None or not isinstance(raw.get("images"), Mapping):
        return None
    poster = raw["images"].get("poster")
    if not isinstance(poster, str) or not poster.strip():
        return None
    try:
        return image_store.register(
            ImageDescriptor(
                config_entry_id=image_store.config_entry_id,
                source=MediaSource.RADARR,
                server_id=image_store.server_id,
                candidates=(
                    ImageCandidate(internal_id, ImageKind.PRIMARY, poster, origin_url=poster),
                ),
                allowed_variants=(
                    ImageVariant.POSTER_SMALL,
                    ImageVariant.POSTER_MEDIUM,
                    ImageVariant.POSTER_LARGE,
                ),
            )
        )
    except ValueError:
        return None


def normalize_sonarr(
    raw_episodes: list[dict[str, Any]],
    *,
    now: datetime | None = None,
    timezone: tzinfo = UTC,
    image_store: ImageReferenceStore | None = None,
) -> NormalizedBatch[UpcomingItem]:
    """Keep only the nearest future monitored episode for each series."""
    reference = _as_utc(now or datetime.now(UTC))
    nearest: dict[str, UpcomingItem] = {}
    partial = False
    for raw in raw_episodes:
        if raw.get("monitored") is False:
            continue
        event_date = _parse_date(raw.get("airDateUtc") or raw.get("airDate"), timezone)
        if event_date is None or event_date <= reference:
            continue
        raw_series = raw.get("series")
        series: dict[str, Any] = raw_series if isinstance(raw_series, dict) else {}
        if series.get("monitored") is False:
            continue
        series_id = _string(raw.get("seriesId")) or _integer_string(raw.get("seriesId"))
        title = _string(series.get("title")) or _string(raw.get("seriesTitle"))
        episode_title = _string(raw.get("title"))
        if series_id is None or title is None or episode_title is None:
            partial = True
            continue
        episode_id = _string(raw.get("id")) or _integer_string(raw.get("id")) or series_id
        poster_ref = _register_sonarr_poster(raw, series, image_store, series_id)
        item = UpcomingItem(
            ref=f"sonarr:{episode_id}",
            source=MediaSource.SONARR,
            media_type=MediaType.EPISODE,
            title=title,
            subtitle=episode_title,
            release_at=_iso(event_date),
            monitored=True,
            downloaded=bool(raw.get("hasFile")),
            status=_string(raw.get("status")),
            relative_day=RelativeDay.FUTURE,
            days_remaining=max(0, (event_date.date() - reference.date()).days),
            poster_ref=poster_ref,
            date_kind="air",
            season_number=_integer(raw.get("seasonNumber")),
            episode_number=_integer(raw.get("episodeNumber")),
            episode_title=episode_title,
            image=(
                {"source": "sonarr", "item_id": series_id, "kind": "poster"}
                if poster_ref is not None
                else None
            ),
            all_day=False,
        )
        existing = nearest.get(series_id)
        if existing is None or (_sort_key(item), item.ref) < (_sort_key(existing), existing.ref):
            nearest[series_id] = item
    return NormalizedBatch(tuple(sorted(nearest.values(), key=_sort_key)), partial)


def _register_sonarr_poster(
    raw: Mapping[str, Any],
    series: Mapping[str, Any],
    image_store: ImageReferenceStore | None,
    series_id: str,
) -> str | None:
    """Register a Sonarr series poster when the public payload provides one."""
    if image_store is None:
        return None
    images = raw.get("images") if isinstance(raw.get("images"), Mapping) else series.get("images")
    if not isinstance(images, Mapping):
        return None
    poster = images.get("poster")
    if not isinstance(poster, str) or not poster.strip():
        return None
    try:
        return image_store.register(
            ImageDescriptor(
                config_entry_id=image_store.config_entry_id,
                source=MediaSource.SONARR,
                server_id=image_store.server_id,
                candidates=(
                    ImageCandidate(series_id, ImageKind.PRIMARY, poster, origin_url=poster),
                ),
                allowed_variants=(
                    ImageVariant.POSTER_SMALL,
                    ImageVariant.POSTER_MEDIUM,
                    ImageVariant.POSTER_LARGE,
                ),
            )
        )
    except ValueError:
        return None


def merge_upcoming(
    radarr: NormalizedBatch[UpcomingItem],
    sonarr: NormalizedBatch[UpcomingItem],
    *,
    limit: int = 20,
) -> NormalizedBatch[UpcomingItem]:
    """Merge both sources chronologically with a stable tie-breaker."""
    items = sorted((*radarr.items, *sonarr.items), key=_sort_key)
    return NormalizedBatch(tuple(items[: max(1, limit)]), radarr.partial or sonarr.partial)


def _event_date(event: dict[str, Any], timezone: tzinfo) -> tuple[str, bool] | None:
    start = event.get("start")
    if isinstance(start, dict):
        value: object = start.get("date", start.get("dateTime"))
    else:
        value = start
    if isinstance(value, str) and value.strip():
        if len(value.strip()) == 10 and value[4] == "-" and value[7] == "-":
            return value.strip(), True
        parsed = _parse_date(value, timezone)
        if parsed is not None:
            return _iso(parsed), False
    return None


def _event_is_past(event_date: tuple[str, bool], now: datetime) -> bool:
    value, all_day = event_date
    if all_day:
        return _date_only(value) < now.date()
    parsed = _parse_date(value)
    return parsed is None or parsed <= now


def _date_only(value: str) -> date:
    return datetime.fromisoformat(value[:10]).date()


def _parse_date(value: object, timezone: tzinfo = UTC) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    return _as_utc(parsed, timezone)


def _as_utc(value: datetime, timezone: tzinfo = UTC) -> datetime:
    return (value if value.tzinfo is not None else value.replace(tzinfo=timezone)).astimezone(UTC)


def _iso(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _sort_key(item: UpcomingItem) -> tuple[str, str, str, str]:
    return (item.release_at, item.source.value, item.title.casefold(), item.ref)


def _string(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _integer(value: object) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _integer_string(value: object) -> str | None:
    return str(value) if isinstance(value, int) and not isinstance(value, bool) else None
