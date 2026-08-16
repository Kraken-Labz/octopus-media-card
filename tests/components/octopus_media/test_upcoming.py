"""Sanitized real Home Assistant Upcoming payload policy tests."""

from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from custom_components.octopus_media.image_store import ImageReferenceStore
from custom_components.octopus_media.models import MediaSource, MediaType
from custom_components.octopus_media.normalizers import (
    merge_upcoming,
    normalize_radarr,
    normalize_sonarr,
)

NOW = datetime(2030, 1, 10, tzinfo=UTC)


def test_radarr_exact_mapping_key_join_and_date_only() -> None:
    batch = normalize_radarr(
        {
            "Movie": {
                "id": 287,
                "title": "Movie",
                "monitored": True,
                "has_file": True,
                "images": {"poster": "https://invalid/poster.jpg"},
            },
            "Unmonitored": {"id": 288, "title": "Unmonitored", "monitored": False},
        },
        calendar_events=[
            {"summary": "Movie", "start": {"date": "2030-01-20"}},
            {"summary": "Unmonitored", "start": {"date": "2030-01-21"}},
        ],
        now=NOW,
    )
    assert len(batch.items) == 1
    item = batch.items[0]
    assert item.ref == "radarr:287"
    assert item.date_kind == "release"
    assert item.release_at == "2030-01-20"
    assert item.all_day is True
    assert item.image == {"source": "radarr", "item_id": 287, "kind": "poster"}


def test_radarr_poster_is_registered_as_opaque_reference() -> None:
    store = ImageReferenceStore(
        "fixture-secret", config_entry_id="fixture_entry", server_id="fixture_server"
    )
    batch = normalize_radarr(
        {
            "Movie": {
                "id": 287,
                "title": "Movie",
                "monitored": True,
                "images": {"poster": "https://images.example.test/poster.jpg"},
            }
        },
        calendar_events=[{"summary": "Movie", "start": {"date": "2030-01-20"}}],
        now=NOW,
        image_store=store,
    )
    reference = batch.items[0].poster_ref
    assert reference is not None
    assert reference.startswith("image_")
    assert "https://" not in reference
    assert store.resolve(reference, "poster-medium").source is MediaSource.RADARR


def test_radarr_release_type_is_optional_and_preserved() -> None:
    batch = normalize_radarr(
        {"Movie": {"id": 287, "title": "Movie", "monitored": True, "release_type": "digital"}},
        calendar_events=[{"summary": "Movie", "start": {"date": "2030-01-20"}}],
        now=NOW,
    )
    assert batch.items[0].release_type == "digital"


def test_sonarr_series_poster_uses_same_opaque_reference_path() -> None:
    store = ImageReferenceStore(
        "fixture-secret", config_entry_id="fixture_entry", server_id="fixture_server"
    )
    batch = normalize_sonarr(
        [
            {
                "id": 11,
                "seriesId": 7,
                "series": {
                    "title": "Series A",
                    "images": {"poster": "https://images.example.test/series.jpg"},
                },
                "title": "Episode",
                "airDateUtc": "2030-01-12T01:00:00Z",
            }
        ],
        now=NOW,
        image_store=store,
    )
    item = batch.items[0]
    assert item.poster_ref is not None
    assert item.image == {"source": "sonarr", "item_id": "7", "kind": "poster"}


def test_sonarr_home_assistant_action_shape_is_normalized() -> None:
    """Accept the snake_case episode mapping returned by sonarr.get_upcoming."""
    batch = normalize_sonarr(
        [
            {
                "id": 1101,
                "series_id": 7,
                "season_number": 4,
                "episode_number": 3,
                "title": "Episode title",
                "air_date_utc": "2030-01-12T01:00:00Z",
                "has_file": False,
                "monitored": True,
                "series_title": "Series A",
                "images": {"poster": "https://images.example.test/series.jpg"},
            }
        ],
        now=NOW,
    )

    assert len(batch.items) == 1
    item = batch.items[0]
    assert item.ref == "sonarr:1101"
    assert item.title == "Series A"
    assert item.season_number == 4
    assert item.episode_number == 3
    assert item.release_at == "2030-01-12T01:00:00Z"


def test_radarr_requires_exact_summary_key_without_fallback() -> None:
    batch = normalize_radarr(
        {"Movie": {"id": 1, "title": "Movie", "monitored": True}},
        calendar_events=[
            {"summary": "movie", "start": {"date": "2030-01-20"}},
            {"summary": "Missing", "start": {"date": "2030-01-21"}},
        ],
        now=NOW,
    )
    assert batch.items == ()


def test_radarr_ignores_past_date() -> None:
    batch = normalize_radarr(
        {"Past": {"id": 1, "title": "Past", "monitored": True}},
        calendar_events=[{"summary": "Past", "start": {"date": "2030-01-01"}}],
        now=NOW,
    )
    assert batch.items == ()


def test_sonarr_empty_mapping_is_valid_empty() -> None:
    assert normalize_sonarr([], now=NOW).items == ()


def test_sonarr_nearest_episode_per_series_and_datetime() -> None:
    batch = normalize_sonarr(
        [
            {
                "id": 11,
                "seriesId": 7,
                "series": {"title": "Series A", "monitored": True},
                "title": "First",
                "airDateUtc": "2030-01-12T01:00:00Z",
            },
            {
                "id": 12,
                "seriesId": 7,
                "series": {"title": "Series A", "monitored": True},
                "title": "Second",
                "airDateUtc": "2030-01-13T01:00:00Z",
            },
        ],
        now=NOW,
    )
    assert len(batch.items) == 1
    assert batch.items[0].media_type is MediaType.EPISODE
    assert batch.items[0].all_day is False


def test_date_only_remains_all_day_without_fabricated_time() -> None:
    batch = normalize_radarr(
        {"Movie": {"id": 1, "title": "Movie", "monitored": True}},
        calendar_events=[{"summary": "Movie", "start": {"date": "2030-01-20"}}],
        now=NOW,
        timezone=ZoneInfo("America/Sao_Paulo"),
    )
    item = batch.items[0]
    assert item.release_at == "2030-01-20"
    assert item.all_day is True


def test_offset_datetime_is_normalized_as_absolute_instant() -> None:
    batch = normalize_sonarr(
        [
            {
                "id": 11,
                "seriesId": 7,
                "series": {"title": "Series A", "monitored": True},
                "title": "Episode",
                "airDate": "2030-01-12T01:00:00-03:00",
            }
        ],
        now=NOW,
        timezone=ZoneInfo("America/Sao_Paulo"),
    )
    assert batch.items[0].release_at == "2030-01-12T04:00:00Z"


def test_naive_datetime_is_interpreted_in_home_assistant_timezone() -> None:
    batch = normalize_sonarr(
        [
            {
                "id": 11,
                "seriesId": 7,
                "series": {"title": "Series A", "monitored": True},
                "title": "Episode",
                "airDate": "2030-01-12T01:00:00",
            }
        ],
        now=NOW,
        timezone=ZoneInfo("America/Sao_Paulo"),
    )
    assert batch.items[0].release_at == "2030-01-12T04:00:00Z"


def test_merge_mixed_date_only_and_datetime_is_deterministic() -> None:
    radarr = normalize_radarr(
        {"Movie": {"id": 1, "title": "Movie", "monitored": True}},
        calendar_events=[{"summary": "Movie", "start": {"date": "2030-01-12"}}],
        now=NOW,
    )
    sonarr = normalize_sonarr(
        [
            {
                "id": 2,
                "seriesId": 2,
                "series": {"title": "Show"},
                "title": "Episode",
                "airDateUtc": "2030-01-12T00:00:00Z",
            }
        ],
        now=NOW,
    )
    result = merge_upcoming(radarr, sonarr)
    assert [item.source for item in result.items] == [MediaSource.RADARR, MediaSource.SONARR]
