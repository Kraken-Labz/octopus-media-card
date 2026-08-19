"""Pure Jellyfin recent and playing normalization tests."""

from copy import deepcopy
from typing import cast

from custom_components.octopus_media.api.jellyfin_types import (
    JellyfinDevice,
    JellyfinMediaItem,
    JellyfinSession,
)
from custom_components.octopus_media.image_store import (
    ImageReferenceStore,
    is_opaque_image_reference,
)
from custom_components.octopus_media.models import MediaType, PlayingState
from custom_components.octopus_media.normalizers.jellyfin import (
    derive_media_reference,
    normalize_recent_items,
    normalize_sessions,
)

from tests.fixtures.jellyfin import (
    EPISODE_NEWEST,
    EPISODE_OLDER,
    IDLE_SESSION,
    LONG_TITLE,
    MISSING_FIELDS,
    MOVIE,
    paused_session,
    playing_session,
)

SECRET = "fixture-reference-secret-with-enough-entropy"


def media_items(*items: object) -> list[JellyfinMediaItem]:
    return cast(list[JellyfinMediaItem], list(items))


def sessions(*items: object) -> list[JellyfinSession]:
    return cast(list[JellyfinSession], list(items))


def test_movies_and_episodes_are_normalized_sorted_and_utc() -> None:
    store = ImageReferenceStore(SECRET)
    batch = normalize_recent_items(
        media_items(MOVIE, EPISODE_NEWEST),
        secret=SECRET,
        image_store=store,
        group_episodes=False,
        limit=12,
    )
    episode, movie = batch.items
    assert episode.media_type is MediaType.EPISODE
    assert episode.title == "Harbor of Small Comets"
    assert episode.subtitle == "T02E04 · A Map of Quiet Water"
    assert episode.added_at == "2030-04-05T11:00:00Z"
    assert movie.media_type is MediaType.MOVIE
    assert movie.year == 2030
    assert movie.poster_ref and is_opaque_image_reference(movie.poster_ref)
    assert movie.backdrop_ref and is_opaque_image_reference(movie.backdrop_ref)
    assert episode.poster_ref
    episode_descriptor = store.resolve(episode.poster_ref, "poster-medium")
    assert episode_descriptor.internal_media_id == EPISODE_NEWEST["SeriesId"]
    assert episode.still_ref
    still_descriptor = store.resolve(episode.still_ref, "poster-medium")
    assert still_descriptor.internal_media_id == EPISODE_NEWEST["Id"]
    assert episode.poster_ref != episode.still_ref


def test_episode_poster_and_still_remain_contextually_separate() -> None:
    episode = deepcopy(EPISODE_NEWEST)
    episode["ImageTags"] = {"Primary": "episode-primary-revision"}
    recent_store = ImageReferenceStore(SECRET)
    recent = normalize_recent_items(
        media_items(episode),
        secret=SECRET,
        image_store=recent_store,
        group_episodes=False,
        limit=12,
    ).items[0]
    assert recent.poster_ref
    recent_descriptor = recent_store.resolve(recent.poster_ref, "poster-medium")
    assert [candidate.internal_media_id for candidate in recent_descriptor.candidates] == [
        episode["SeriesId"],
        episode["ParentPrimaryImageItemId"],
    ]
    assert recent.still_ref
    recent_still = recent_store.resolve(recent.still_ref, "poster-medium")
    assert recent_still.internal_media_id == episode["Id"]

    session = paused_session()
    session["NowPlayingItem"] = {**episode, "RunTimeTicks": 2_400_000_0000}
    playing_store = ImageReferenceStore(SECRET)
    playing = normalize_sessions(
        sessions(session), secret=SECRET, image_store=playing_store, devices={}
    ).items[0]
    assert playing.poster_ref
    playing_descriptor = playing_store.resolve(playing.poster_ref, "poster-medium")
    assert [candidate.internal_media_id for candidate in playing_descriptor.candidates] == [
        episode["SeriesId"],
        episode["ParentPrimaryImageItemId"],
    ]
    assert playing.still_ref
    playing_still = playing_store.resolve(playing.still_ref, "poster-large")
    assert playing_still.internal_media_id == episode["Id"]


def test_episode_poster_falls_back_to_season_without_using_episode_primary() -> None:
    episode = deepcopy(EPISODE_NEWEST)
    episode.pop("SeriesId")
    episode.pop("SeriesPrimaryImageTag")
    store = ImageReferenceStore(SECRET)
    item = normalize_recent_items(
        media_items(episode),
        secret=SECRET,
        image_store=store,
        group_episodes=False,
        limit=12,
    ).items[0]
    assert item.poster_ref
    assert (
        store.resolve(item.poster_ref, "poster-medium").internal_media_id
        == episode["ParentPrimaryImageItemId"]
    )
    assert item.still_ref


def test_episode_without_series_or_season_uses_placeholder_but_keeps_still() -> None:
    episode = deepcopy(EPISODE_NEWEST)
    for key in (
        "SeriesId",
        "SeriesPrimaryImageTag",
        "ParentPrimaryImageItemId",
        "ParentPrimaryImageTag",
    ):
        episode.pop(key)
    item = normalize_recent_items(
        media_items(episode),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        group_episodes=False,
        limit=12,
    ).items[0]
    assert item.poster_ref is None
    assert item.still_ref is not None


def test_episode_without_any_image_uses_placeholders() -> None:
    episode = deepcopy(EPISODE_NEWEST)
    for key in (
        "SeriesId",
        "SeriesPrimaryImageTag",
        "ParentPrimaryImageItemId",
        "ParentPrimaryImageTag",
        "ImageTags",
    ):
        episode.pop(key)
    item = normalize_recent_items(
        media_items(episode),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        group_episodes=False,
        limit=12,
    ).items[0]
    assert item.poster_ref is None
    assert item.still_ref is None


def test_grouping_preserves_newest_episode_and_counts_series() -> None:
    batch = normalize_recent_items(
        media_items(EPISODE_OLDER, EPISODE_NEWEST, MOVIE),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        group_episodes=True,
        limit=12,
    )
    grouped = batch.items[0]
    assert grouped.media_type is MediaType.SERIES
    assert grouped.episode_count == 2
    assert grouped.episode == 4
    assert grouped.subtitle == "T02E04 · A Map of Quiet Water"
    assert grouped.ref != EPISODE_NEWEST["SeriesId"]


def test_missing_optional_fields_and_unsupported_items_are_not_partial() -> None:
    invalid = {"Id": "fixture-invalid", "Type": "Audio", "Name": "Ignored"}
    batch = normalize_recent_items(
        media_items(MISSING_FIELDS, invalid),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        group_episodes=False,
        limit=12,
    )
    assert batch.partial is False
    item = batch.items[0]
    assert item.added_at is None
    assert item.year is None
    assert item.rating is None
    assert item.poster_ref is None


def test_malformed_supported_item_marks_partial() -> None:
    malformed = {"Type": "Movie", "Name": "Missing ID"}
    batch = normalize_recent_items(
        media_items(MOVIE, malformed),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        group_episodes=False,
        limit=12,
    )
    assert len(batch.items) == 1
    assert batch.partial is True


def test_media_references_are_deterministic_opaque_and_secret_bound() -> None:
    first = derive_media_reference(SECRET, "recent", "fixture-id")
    assert first == derive_media_reference(SECRET, "recent", "fixture-id")
    assert first != derive_media_reference(f"{SECRET}-other", "recent", "fixture-id")
    assert "fixture-id" not in first


def test_playing_custom_device_name_progress_and_deterministic_sort() -> None:
    batch = normalize_sessions(
        sessions(paused_session(), IDLE_SESSION, playing_session()),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices={
            "fixture-device-a": {
                "Id": "fixture-device-a",
                "Name": "Test Display A",
                "CustomName": "Fixture Room",
            }
        },
    )
    assert len(batch.items) == 2
    named = next(item for item in batch.items if item.device_name == "Fixture Room")
    paused = next(item for item in batch.items if item.state is PlayingState.PAUSED)
    assert named.device_alias is None
    assert named.position_seconds == 720
    assert round(named.progress, 2) == 13.33
    assert named.genres == ("Adventure", "Science fiction")
    assert named.rating == 8.1
    assert named.video_resolution == "1080p"
    assert named.video_hdr is True
    assert named.audio_channels == "5.1"
    assert paused.title == "Harbor of Small Comets"
    assert paused.subtitle == "T02E04 · A Map of Quiet Water"
    assert paused.video_resolution is None
    assert paused.video_hdr is False
    assert paused.audio_channels is None
    assert all("fixture-device" not in item.ref for item in batch.items)


def test_playing_technical_metadata_uses_selected_streams_and_safe_labels() -> None:
    session = playing_session()
    session["NowPlayingItem"]["MediaStreams"] = [
        {"Index": 0, "Type": "Video", "Width": 1280, "Height": 720, "VideoRange": "SDR"},
        {
            "Index": 2,
            "Type": "Video",
            "Width": 3840,
            "Height": 2160,
            "VideoRangeType": "DOVIWithHDR10",
        },
        {"Index": 1, "Type": "Audio", "Channels": 2},
        {"Index": 3, "Type": "Audio", "Channels": 8},
    ]
    session["PlayState"]["VideoStreamIndex"] = 2
    session["PlayState"]["AudioStreamIndex"] = 3
    item = normalize_sessions(
        sessions(session),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices={},
    ).items[0]
    assert item.video_resolution == "4K"
    assert item.video_hdr is True
    assert item.audio_channels == "7.1"


def test_missing_playing_metadata_stays_empty_without_placeholders() -> None:
    session = playing_session()
    for field in ("Genres", "CommunityRating", "MediaStreams"):
        session["NowPlayingItem"].pop(field, None)
    item = normalize_sessions(
        sessions(session),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices={},
    ).items[0]
    assert item.genres == ()
    assert item.rating is None
    assert item.video_resolution is None
    assert item.video_hdr is False
    assert item.audio_channels is None


def test_zero_duration_is_safe_and_long_title_survives() -> None:
    session = playing_session()
    session["NowPlayingItem"]["RunTimeTicks"] = 0
    session["NowPlayingItem"]["Name"] = LONG_TITLE
    batch = normalize_sessions(
        sessions(session),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices={},
    )
    assert batch.items[0].duration_seconds == 0
    assert batch.items[0].progress == 0
    assert batch.items[0].title == LONG_TITLE


def test_invalid_active_media_marks_partial_without_emitting_raw_data() -> None:
    broken = deepcopy(playing_session())
    broken["NowPlayingItem"].pop("Id")
    batch = normalize_sessions(
        sessions(broken),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices={},
    )
    assert batch.items == ()
    assert batch.partial is True


def test_device_name_uses_exact_catalog_id_and_closed_fallback_order() -> None:
    session = playing_session()
    session["Client"] = "Fixture Client"
    catalog: dict[str, JellyfinDevice] = {
        "fixture-device-a": {
            "Id": "fixture-device-a",
            "Name": "Catalog Base Name",
            "CustomName": "Escritório",
        },
        "FIXTURE-DEVICE-A": {
            "Id": "FIXTURE-DEVICE-A",
            "CustomName": "Wrong Case Match",
        },
    }
    item = normalize_sessions(
        sessions(session),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices=catalog,
    ).items[0]
    assert item.device_name == "Escritório"
    assert item.device_alias is None
    assert "fixture-device-a" not in str(item.as_dict())

    without_catalog_name = deepcopy(session)
    without_catalog_name["DeviceId"] = "unknown-device"
    assert (
        normalize_sessions(
            sessions(without_catalog_name),
            secret=SECRET,
            image_store=ImageReferenceStore(SECRET),
            devices=catalog,
        )
        .items[0]
        .device_name
        == "Test Display A"
    )

    without_session_name = deepcopy(without_catalog_name)
    without_session_name.pop("DeviceName")
    assert (
        normalize_sessions(
            sessions(without_session_name),
            secret=SECRET,
            image_store=ImageReferenceStore(SECRET),
            devices=catalog,
        )
        .items[0]
        .device_name
        == "Fixture Client"
    )

    without_client = deepcopy(without_session_name)
    without_client.pop("Client")
    assert (
        normalize_sessions(
            sessions(without_client),
            secret=SECRET,
            image_store=ImageReferenceStore(SECRET),
            devices=catalog,
        )
        .items[0]
        .device_name
        == "Dispositivo Jellyfin"
    )

    without_device_id = deepcopy(session)
    without_device_id.pop("DeviceId")
    assert (
        normalize_sessions(
            sessions(without_device_id),
            secret=SECRET,
            image_store=ImageReferenceStore(SECRET),
            devices=catalog,
        )
        .items[0]
        .device_name
        == "Test Display A"
    )


def test_multiple_sessions_with_duplicate_original_names_use_exact_ids() -> None:
    first = playing_session()
    second = paused_session()
    second["DeviceName"] = "Test Display A"
    catalog: dict[str, JellyfinDevice] = {
        "fixture-device-a": {
            "Id": "fixture-device-a",
            "Name": "Test Display A",
            "CustomName": "Fixture Office",
        },
        "fixture-device-b": {
            "Id": "fixture-device-b",
            "Name": "Test Display A",
            "CustomName": "Fixture Bedroom",
        },
    }
    batch = normalize_sessions(
        sessions(first, second),
        secret=SECRET,
        image_store=ImageReferenceStore(SECRET),
        devices=catalog,
    )
    assert {item.device_name for item in batch.items} == {
        "Fixture Bedroom",
        "Fixture Office",
    }
    assert all(item.device_alias is None for item in batch.items)
