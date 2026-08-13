"""Entirely fictitious Jellyfin DTO subsets for Phase 3A tests."""

from copy import deepcopy
from typing import Any

SERVER_INFO = {
    "Id": "0000000000000000000000000000a001",
    "ServerName": "Fixture Harbor",
    "Version": "10.11.0",
}

USERS = [
    {"Id": "0000000000000000000000000000b001", "Name": "Demo Viewer"},
    {"Id": "0000000000000000000000000000b002", "Name": "Sample Viewer"},
]

MOVIE = {
    "Id": "0000000000000000000000000000c001",
    "Type": "Movie",
    "Name": "The Clockwork Island",
    "ProductionYear": 2030,
    "DateCreated": "2030-04-05T10:00:00Z",
    "Genres": ["Adventure", "Science fiction", "Mystery"],
    "CommunityRating": 8.1,
    "MediaStreams": [
        {
            "Index": 0,
            "Type": "Video",
            "Width": 1920,
            "Height": 1080,
            "VideoRange": "HDR",
            "VideoRangeType": "HDR10",
        },
        {
            "Index": 1,
            "Type": "Audio",
            "Channels": 6,
            "ChannelLayout": "5.1",
        },
    ],
    "ImageTags": {"Primary": "poster-revision-a"},
    "BackdropImageTags": ["backdrop-revision-a"],
}

EPISODE_NEWEST = {
    "Id": "0000000000000000000000000000c002",
    "Type": "Episode",
    "Name": "A Map of Quiet Water",
    "SeriesId": "0000000000000000000000000000d001",
    "SeriesName": "Harbor of Small Comets",
    "SeriesPrimaryImageTag": "series-poster-revision",
    "ParentPrimaryImageItemId": "0000000000000000000000000000e001",
    "ParentPrimaryImageTag": "season-poster-revision",
    "ImageTags": {"Primary": "episode-horizontal-still-revision"},
    "ProductionYear": 2030,
    "ParentIndexNumber": 2,
    "IndexNumber": 4,
    "Genres": ["Drama", "Adventure"],
    "CommunityRating": 8.7,
    "DateCreated": "2030-04-05T11:00:00+00:00",
}

EPISODE_OLDER = {
    **EPISODE_NEWEST,
    "Id": "0000000000000000000000000000c003",
    "Name": "The Lantern Current",
    "IndexNumber": 3,
    "DateCreated": "2030-04-05T09:00:00Z",
}

MISSING_FIELDS = {
    "Id": "0000000000000000000000000000c004",
    "Type": "Movie",
    "Name": "Paper Moons of Meridian",
}

LONG_TITLE = (
    "A Deliberately Extremely Long Fictional Title About Cartographers Mapping Every Quiet "
    "Constellation"
)


def playing_session() -> dict[str, Any]:
    """Return a fresh playing session fixture."""
    return {
        "Id": "session-fixture-a",
        "DeviceId": "fixture-device-a",
        "DeviceName": "Test Display A",
        "UserName": "Demo Viewer",
        "LastActivityDate": "2030-04-05T12:00:00Z",
        "NowPlayingItem": {**deepcopy(MOVIE), "RunTimeTicks": 5_400_000_0000},
        "PlayState": {
            "IsPaused": False,
            "PositionTicks": 720_000_0000,
            "VideoStreamIndex": 0,
            "AudioStreamIndex": 1,
        },
    }


def paused_session() -> dict[str, Any]:
    """Return a fresh paused episode session fixture."""
    return {
        "Id": "session-fixture-b",
        "DeviceId": "fixture-device-b",
        "DeviceName": "Test Display B",
        "UserName": "Sample Viewer",
        "LastActivityDate": "2030-04-05T12:01:00Z",
        "NowPlayingItem": {**deepcopy(EPISODE_NEWEST), "RunTimeTicks": 2_400_000_0000},
        "PlayState": {
            "IsPaused": True,
            "PositionTicks": 600_000_0000,
            "VideoStreamIndex": 0,
            "AudioStreamIndex": 1,
        },
    }


IDLE_SESSION = {
    "Id": "session-fixture-idle",
    "DeviceId": "fixture-device-idle",
    "DeviceName": "Idle Test Display",
    "UserName": "Demo Viewer",
    "PlayState": {"IsPaused": False, "PositionTicks": 0},
}
