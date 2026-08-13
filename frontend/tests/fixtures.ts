import type { HomeAssistant, UnsubscribeFunc } from "../src/ha-types";
import type {
  DashboardSnapshot,
  PlayingItem,
  RecentItem,
  SnapshotEvent,
  UpcomingItem,
} from "../src/models";

const NOW = "2030-04-05T12:00:00Z";
const ENTRY_ID = "fixture_entry_001";

const availability: DashboardSnapshot["availability"] = {
  jellyfin: { state: "online", last_success_at: NOW, error: null },
  radarr: { state: "not_configured", last_success_at: null, error: null },
  sonarr: { state: "not_configured", last_success_at: null, error: null },
};

export const threeRecentMovies: RecentItem[] = [
  {
    ref: "media_recent_01",
    type: "movie",
    title: "The Clockwork Island",
    subtitle: "A fictional feature",
    year: 2030,
    season: null,
    episode: null,
    episode_count: 0,
    added_at: "2030-04-05T10:00:00Z",
    rating: 8.1,
    poster_ref: "image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    still_ref: null,
    backdrop_ref: "image_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  },
  {
    ref: "media_recent_02",
    type: "movie",
    title: "Lanterns Beyond Europa",
    subtitle: "A fictional feature",
    year: 2029,
    season: null,
    episode: null,
    episode_count: 0,
    added_at: "2030-04-05T09:00:00Z",
    rating: 7.4,
    poster_ref: "image_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    still_ref: null,
    backdrop_ref: "image_GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  },
  {
    ref: "media_recent_03",
    type: "movie",
    title: "Paper Moons of Meridian",
    subtitle: "A fictional feature",
    year: 2028,
    season: null,
    episode: null,
    episode_count: 0,
    added_at: "2030-04-05T08:00:00Z",
    rating: null,
    poster_ref: null,
    still_ref: null,
    backdrop_ref: null,
  },
];

export const groupedEpisodes: RecentItem[] = [
  {
    ref: "media_group_01",
    type: "series",
    title: "Harbor of Small Comets",
    subtitle: "Season 2 - 4 new episodes",
    year: 2030,
    season: 2,
    episode: null,
    episode_count: 4,
    added_at: "2030-04-04T20:00:00Z",
    rating: null,
    poster_ref: "image_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    still_ref: null,
    backdrop_ref: null,
  },
];

const groupedEpisode = groupedEpisodes[0];
if (!groupedEpisode) throw new Error("The grouped episode fixture is missing");

export const episodeWithSeparateArtwork: RecentItem = {
  ...groupedEpisode,
  ref: "media_episode_context_01",
  type: "episode",
  title: "Harbor of Small Comets",
  subtitle: "T02E04 · A Map of Quiet Water",
  season: 2,
  episode: 4,
  episode_count: 1,
  poster_ref: "image_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
  still_ref: "image_EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
  backdrop_ref: "image_HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
};

export const upcomingRadarrAndSonarr: UpcomingItem[] = [
  {
    ref: "media_upcoming_01",
    source: "radarr",
    type: "movie",
    title: "Signal Garden",
    subtitle: "Digital release",
    release_at: "2030-04-06T03:00:00Z",
    monitored: true,
    downloaded: false,
    status: "announced",
    relative_day: "tomorrow",
    days_remaining: 1,
    poster_ref: "image_DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    event_date: "2030-04-06",
    all_day: true,
    date_kind: "release",
    release_type: "digital",
  },
  {
    ref: "media_upcoming_02",
    source: "sonarr",
    type: "episode",
    title: "Atlas of Quiet Stars",
    subtitle: "S01E07",
    release_at: "2030-04-07T01:30:00Z",
    monitored: true,
    downloaded: false,
    status: "continuing",
    relative_day: "future",
    days_remaining: 2,
    poster_ref: null,
    event_date: "2030-04-07T01:30:00Z",
    all_day: false,
    date_kind: "air",
    season_number: 1,
    episode_number: 7,
    episode_title: "The First Signal",
  },
];

export const onePlayingSession: PlayingItem[] = [
  {
    ref: "session_fixture_01",
    device_name: "Test Display A",
    device_alias: "Fixture Room",
    user_name: "Demo Viewer",
    state: "playing",
    type: "movie",
    title: "The Clockwork Island",
    subtitle: "2030",
    genres: ["Adventure", "Science fiction", "Mystery"],
    rating: 8.1,
    video_resolution: "1080p",
    video_hdr: true,
    audio_channels: "5.1",
    position_seconds: 720,
    duration_seconds: 5400,
    progress: 13.3333,
    poster_ref: "image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    still_ref: null,
    backdrop_ref: "image_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    updated_at: NOW,
  },
];

const firstPlayingSession = onePlayingSession[0];
const firstRecentMovie = threeRecentMovies[0];
if (!firstPlayingSession || !firstRecentMovie) {
  throw new Error("The static fixture catalog is incomplete");
}

export const multiplePlayingSessions: PlayingItem[] = [
  ...onePlayingSession,
  {
    ...firstPlayingSession,
    ref: "session_fixture_02",
    device_name: "Test Display B",
    device_alias: null,
    user_name: "Sample Viewer",
    state: "paused",
    title: "Lanterns Beyond Europa",
    position_seconds: 1800,
    progress: 33.3333,
  },
];

export const manyPlayingSessions: PlayingItem[] = [
  ...multiplePlayingSessions,
  ...Array.from({ length: 3 }, (_, index) => ({
    ...firstPlayingSession,
    ref: `session_fixture_many_${String(index + 3)}`,
    device_name: `Fictional Display ${String(index + 3)}`,
    device_alias: index === 0 ? "A Deliberately Long Fictional Friendly Device Alias" : null,
    user_name: `Fixture Viewer ${String(index + 3)}`,
    title: `Fictional Session ${String(index + 3)}`,
    position_seconds: 900 + index * 300,
    progress: 20 + index * 5,
  })),
];

export const episodePlayingSession: PlayingItem = {
  ...firstPlayingSession,
  ref: "session_fixture_episode",
  type: "episode",
  title: "Harbor of Small Comets",
  subtitle: "T02E04 · A Map of Quiet Water",
  genres: ["Drama", "Adventure"],
  rating: 8.7,
  video_resolution: "4K",
  video_hdr: true,
  audio_channels: "5.1",
  poster_ref: "image_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
  still_ref: "image_EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
  backdrop_ref: "image_HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
};

export const pausedPlayingSession: PlayingItem = {
  ...firstPlayingSession,
  ref: "session_fixture_paused",
  state: "paused",
};

export const extremelyLongTitle =
  "A Deliberately Extremely Long Fictional Title About Cartographers Mapping Every Quiet Constellation";

function snapshot(overrides: Partial<DashboardSnapshot> = {}): DashboardSnapshot {
  return {
    schema_version: 1,
    entry_id: ENTRY_ID,
    revision: 1,
    updated_at: NOW,
    time_zone: "Etc/UTC",
    availability,
    recent: { revision: 1, updated_at: NOW, stale: false, partial: false, items: [] },
    upcoming: { revision: 1, updated_at: NOW, stale: false, partial: false, items: [] },
    playing: { revision: 1, updated_at: NOW, stale: false, partial: false, items: [] },
    ...overrides,
  };
}

export const recentEmpty = snapshot();
export const recentThreeMovies = snapshot({
  recent: { revision: 2, updated_at: NOW, stale: false, partial: false, items: threeRecentMovies },
});
const completeRecentGallery: RecentItem[] = [
  ...threeRecentMovies,
  ...threeRecentMovies.map((item, index) => ({
    ...item,
    ref: `${item.ref}_gallery_${String(index + 1)}`,
  })),
];
export const episodeArtworkSnapshot = snapshot({
  recent: {
    revision: 8,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [episodeWithSeparateArtwork, ...completeRecentGallery],
  },
});
export const recentGroupedEpisodes = snapshot({
  recent: { revision: 3, updated_at: NOW, stale: false, partial: false, items: groupedEpisodes },
});
export const upcomingMixed = snapshot({
  upcoming: {
    revision: 2,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: upcomingRadarrAndSonarr,
  },
});

const upcomingPosterMovie: UpcomingItem = {
  ref: "upcoming_movie_poster",
  source: "radarr",
  type: "movie",
  title: "Dune: Part Three",
  subtitle: null,
  release_at: "2030-04-06",
  monitored: true,
  downloaded: false,
  status: "announced",
  relative_day: "tomorrow",
  days_remaining: 1,
  poster_ref: "image_DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
  event_date: "2030-04-06",
  all_day: true,
  date_kind: "release",
  release_type: "digital",
};
const upcomingMovieNoPoster: UpcomingItem = {
  ...upcomingPosterMovie,
  ref: "upcoming_movie_no_poster",
  title: "A Film Without Artwork",
  poster_ref: null,
  release_at: "2030-04-11",
  event_date: "2030-04-11",
  relative_day: "future",
  days_remaining: 6,
  release_type: null,
};
const upcomingEpisodePoster: UpcomingItem = {
  ref: "upcoming_episode_poster",
  source: "sonarr",
  type: "episode",
  title: "The Quiet Harbor",
  subtitle: "A Map of Quiet Water",
  release_at: "2030-04-07T01:30:00Z",
  monitored: true,
  downloaded: false,
  status: "continuing",
  relative_day: "future",
  days_remaining: 2,
  poster_ref: "image_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
  event_date: "2030-04-07T01:30:00Z",
  all_day: false,
  date_kind: "air",
  season_number: 2,
  episode_number: 4,
  episode_title: "A Map of Quiet Water",
};
const upcomingEpisodeNoPoster: UpcomingItem = {
  ...upcomingEpisodePoster,
  ref: "upcoming_episode_no_poster",
  title: "Untitled Series",
  subtitle: "Special",
  poster_ref: null,
  season_number: null,
  episode_number: null,
  release_at: "2030-04-12T04:00:00Z",
  event_date: "2030-04-12T04:00:00Z",
  days_remaining: 7,
};
const upcomingLongTitle: UpcomingItem = {
  ...upcomingPosterMovie,
  ref: "upcoming_long_title",
  title: extremelyLongTitle,
  release_at: "2030-04-13",
  event_date: "2030-04-13",
  relative_day: "future",
  days_remaining: 8,
};

export const upcomingVisualDesktop = snapshot({
  availability: {
    ...availability,
    radarr: { state: "online", last_success_at: NOW, error: null },
    sonarr: { state: "online", last_success_at: NOW, error: null },
  },
  upcoming: {
    revision: 20,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      upcomingPosterMovie,
      upcomingEpisodePoster,
      upcomingMovieNoPoster,
      upcomingEpisodeNoPoster,
      upcomingLongTitle,
      { ...upcomingPosterMovie, ref: "upcoming_same_date", title: "Same Date Release" },
    ],
  },
});
export const upcomingVisualArtwork = snapshot({
  ...upcomingVisualDesktop,
  upcoming: {
    ...upcomingVisualDesktop.upcoming,
    revision: 24,
    items: [
      upcomingPosterMovie,
      upcomingEpisodePoster,
      {
        ...upcomingMovieNoPoster,
        ref: "upcoming_artwork_movie",
        poster_ref: "image_EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
      },
      {
        ...upcomingEpisodeNoPoster,
        ref: "upcoming_artwork_episode",
        poster_ref: "image_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      },
      upcomingLongTitle,
    ],
  },
});
export const upcomingVisualOneMissing = snapshot({
  ...upcomingVisualArtwork,
  upcoming: {
    ...upcomingVisualArtwork.upcoming,
    revision: 25,
    items: [
      upcomingPosterMovie,
      upcomingEpisodePoster,
      { ...upcomingMovieNoPoster, ref: "upcoming_one_missing" },
      {
        ...upcomingEpisodeNoPoster,
        ref: "upcoming_one_missing_episode",
        poster_ref: "image_FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      },
      upcomingLongTitle,
    ],
  },
});
export const upcomingVisualEmpty = snapshot({
  availability: {
    ...availability,
    radarr: { state: "online", last_success_at: NOW, error: null },
    sonarr: { state: "online", last_success_at: NOW, error: null },
  },
  upcoming: { revision: 21, updated_at: NOW, stale: false, partial: false, items: [] },
});
export const upcomingVisualPartial = snapshot({
  ...upcomingVisualDesktop,
  upcoming: {
    ...upcomingVisualDesktop.upcoming,
    revision: 22,
    partial: true,
    items: [upcomingPosterMovie, upcomingEpisodeNoPoster],
  },
});
export const upcomingVisualStale = snapshot({
  ...upcomingVisualDesktop,
  upcoming: { ...upcomingVisualDesktop.upcoming, revision: 23, stale: true },
});
export const playingEmpty = snapshot();
export const playingOne = snapshot({
  playing: { revision: 2, updated_at: NOW, stale: false, partial: false, items: onePlayingSession },
});
export const playingWithoutGenres = snapshot({
  playing: {
    revision: 14,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [{ ...firstPlayingSession, genres: [] }],
  },
});
export const playingWithoutRating = snapshot({
  playing: {
    revision: 15,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [{ ...firstPlayingSession, rating: null }],
  },
});
export const playingWithoutTechnical = snapshot({
  playing: {
    revision: 16,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstPlayingSession,
        video_resolution: null,
        video_hdr: false,
        audio_channels: null,
      },
    ],
  },
});
export const playingMinimalMetadata = snapshot({
  playing: {
    revision: 17,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstPlayingSession,
        genres: [],
        rating: null,
        video_resolution: null,
        video_hdr: false,
        audio_channels: null,
        position_seconds: 0,
        duration_seconds: 0,
        progress: 0,
      },
    ],
  },
});
export const playingMultiple = snapshot({
  playing: {
    revision: 3,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: multiplePlayingSessions,
  },
});
export const playingMany = snapshot({
  playing: {
    revision: 11,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: manyPlayingSessions,
  },
});
export const playingGenericDeviceFallback = snapshot({
  playing: {
    revision: 12,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstPlayingSession,
        device_name: "Dispositivo Jellyfin",
        device_alias: null,
      },
    ],
  },
});
export const playingEpisode = snapshot({
  playing: {
    revision: 4,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [episodePlayingSession],
  },
});
export const playingPaused = snapshot({
  playing: {
    revision: 5,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [pausedPlayingSession],
  },
});
export const playingLongTitle = snapshot({
  playing: {
    revision: 6,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [{ ...firstPlayingSession, title: extremelyLongTitle }],
  },
});
export const playingWithoutImage = snapshot({
  playing: {
    revision: 7,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstPlayingSession,
        poster_ref: null,
        still_ref: null,
        backdrop_ref: null,
      },
    ],
  },
});
export const playingWithoutDuration = snapshot({
  playing: {
    revision: 8,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstPlayingSession,
        position_seconds: 0,
        duration_seconds: 0,
        progress: 0,
      },
    ],
  },
});
export const playingStale = snapshot({
  availability: {
    ...availability,
    jellyfin: { state: "offline", last_success_at: NOW, error: "timeout" },
  },
  playing: {
    revision: 9,
    updated_at: NOW,
    stale: true,
    partial: false,
    items: onePlayingSession,
  },
});
export const playingPartial = snapshot({
  playing: {
    revision: 10,
    updated_at: NOW,
    stale: false,
    partial: true,
    items: onePlayingSession,
  },
});
export const staleSnapshot = snapshot({
  recent: { revision: 4, updated_at: NOW, stale: true, partial: false, items: threeRecentMovies },
});
export const partialFailureSnapshot = snapshot({
  availability: {
    ...availability,
    sonarr: { state: "offline", last_success_at: "2030-04-05T11:30:00Z", error: "timeout" },
  },
  upcoming: {
    revision: 3,
    updated_at: NOW,
    stale: true,
    partial: true,
    items: upcomingRadarrAndSonarr.slice(0, 1),
  },
});
export const jellyfinUnavailable = snapshot({
  availability: {
    ...availability,
    jellyfin: { state: "offline", last_success_at: "2030-04-05T11:30:00Z", error: "timeout" },
  },
  recent: { revision: 2, updated_at: NOW, stale: true, partial: false, items: [] },
  playing: { revision: 2, updated_at: NOW, stale: true, partial: false, items: [] },
});
export const longTitleSnapshot = snapshot({
  recent: {
    revision: 5,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [{ ...firstRecentMovie, title: extremelyLongTitle }, ...completeRecentGallery.slice(1)],
  },
});
export const missingImageSnapshot = snapshot({
  recent: {
    revision: 6,
    updated_at: NOW,
    stale: false,
    partial: false,
    items: [
      {
        ...firstRecentMovie,
        poster_ref: null,
        still_ref: null,
        backdrop_ref: null,
      },
      ...completeRecentGallery.slice(1),
    ],
  },
});

export function fakeHass(event?: SnapshotEvent, subscriptionError?: Error): HomeAssistant {
  return {
    config: { time_zone: "Etc/UTC" },
    language: "en",
    connection: {
      sendMessagePromise<T>(message: Record<string, unknown>): Promise<T> {
        if (message.type === "auth/sign_path") {
          return Promise.resolve({ path: `${String(message.path)}?authSig=fixture` } as T);
        }
        return Promise.resolve({ entries: [] } as T);
      },
      subscribeMessage<T>(callback: (message: T) => void): Promise<UnsubscribeFunc> {
        if (subscriptionError) return Promise.reject(subscriptionError);
        if (event) callback(event as T);
        return Promise.resolve(() => undefined);
      },
    },
  };
}

export function snapshotEvent(value: DashboardSnapshot): SnapshotEvent {
  return { type: "snapshot", snapshot: value };
}
