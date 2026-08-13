"""Typed subset of Jellyfin response DTOs used by Phase 3A."""

from typing import NotRequired, TypedDict


class JellyfinServerInfo(TypedDict):
    """Validated server identity."""

    Id: str
    ServerName: str
    Version: str


class JellyfinUser(TypedDict):
    """Validated selectable user."""

    Id: str
    Name: str


class JellyfinDevice(TypedDict):
    """Fields consumed from a Jellyfin DeviceInfo DTO."""

    Id: str
    Name: NotRequired[str | None]
    CustomName: NotRequired[str | None]
    AppName: NotRequired[str | None]


class JellyfinMediaStream(TypedDict):
    """Technical fields consumed from a BaseItemDto media stream."""

    Index: NotRequired[int | None]
    Type: NotRequired[str]
    Width: NotRequired[int | None]
    Height: NotRequired[int | None]
    VideoRange: NotRequired[str | None]
    VideoRangeType: NotRequired[str | None]
    Channels: NotRequired[int | None]
    ChannelLayout: NotRequired[str | None]


class JellyfinMediaItem(TypedDict):
    """Fields consumed from a Jellyfin BaseItemDto."""

    Id: str
    Type: str
    Name: str
    SeriesId: NotRequired[str]
    SeriesName: NotRequired[str]
    SeriesPrimaryImageTag: NotRequired[str]
    ParentPrimaryImageItemId: NotRequired[str]
    ParentPrimaryImageTag: NotRequired[str]
    ProductionYear: NotRequired[int | None]
    ParentIndexNumber: NotRequired[int | None]
    IndexNumber: NotRequired[int | None]
    DateCreated: NotRequired[str | None]
    Genres: NotRequired[list[str] | None]
    CommunityRating: NotRequired[float | int | None]
    RunTimeTicks: NotRequired[int | None]
    MediaStreams: NotRequired[list[JellyfinMediaStream] | None]
    ImageTags: NotRequired[dict[str, str] | None]
    BackdropImageTags: NotRequired[list[str] | None]
    ParentBackdropItemId: NotRequired[str]
    ParentBackdropImageTags: NotRequired[list[str] | None]


class JellyfinPlayState(TypedDict):
    """Fields consumed from SessionInfoDto.PlayState."""

    IsPaused: NotRequired[bool]
    PositionTicks: NotRequired[int | None]
    AudioStreamIndex: NotRequired[int | None]
    VideoStreamIndex: NotRequired[int | None]


class JellyfinSession(TypedDict):
    """Fields consumed from a Jellyfin SessionInfoDto."""

    Id: NotRequired[str]
    DeviceId: NotRequired[str]
    DeviceName: NotRequired[str]
    Client: NotRequired[str]
    UserName: NotRequired[str]
    LastActivityDate: NotRequired[str | None]
    NowPlayingItem: NotRequired[JellyfinMediaItem | None]
    PlayState: NotRequired[JellyfinPlayState | None]
