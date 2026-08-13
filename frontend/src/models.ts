export const SCHEMA_VERSION = 1 as const;

export type AvailabilityState = "online" | "offline" | "not_configured";
export type AvailabilityError =
  | "auth_failed"
  | "timeout"
  | "unreachable"
  | "unsupported_version"
  | "invalid_response"
  | "unexpected_http"
  | "closed"
  | "unknown";
export type MediaSource = "jellyfin" | "radarr" | "sonarr";
export type MediaType = "movie" | "series" | "episode";
export type PlayingState = "playing" | "paused";
export type RelativeDay = "today" | "tomorrow" | "future" | "overdue";

export interface EntryCapabilities {
  recent: boolean;
  upcoming: boolean;
  playing: boolean;
}

export interface EntrySummary {
  entry_id: string;
  title: string;
  capabilities: EntryCapabilities;
}

export interface ServiceAvailability {
  state: AvailabilityState;
  last_success_at: string | null;
  error: AvailabilityError | null;
}

export interface RecentItem {
  ref: string;
  type: MediaType;
  title: string;
  subtitle: string | null;
  year: number | null;
  season: number | null;
  episode: number | null;
  episode_count: number;
  added_at: string | null;
  rating: number | null;
  poster_ref: string | null;
  still_ref: string | null;
  backdrop_ref: string | null;
}

export interface UpcomingItem {
  ref: string;
  source: "radarr" | "sonarr";
  type: "movie" | "episode";
  title: string;
  subtitle: string | null;
  release_at: string;
  monitored: boolean;
  downloaded: boolean;
  status: string | null;
  relative_day: RelativeDay;
  days_remaining: number;
  poster_ref: string | null;
  event_date?: string;
  all_day?: boolean;
  date_kind?: string | null;
  release_type?: string | null;
  year?: number | null;
  season_number?: number | null;
  episode_number?: number | null;
  episode_title?: string | null;
  image?: { source: string; item_id: string | number; kind: string } | null;
}

export interface PlayingItem {
  ref: string;
  device_name: string;
  device_alias: string | null;
  user_name: string;
  state: PlayingState;
  type: MediaType;
  title: string;
  subtitle: string | null;
  genres: string[];
  rating: number | null;
  video_resolution: string | null;
  video_hdr: boolean;
  audio_channels: string | null;
  position_seconds: number;
  duration_seconds: number;
  progress: number;
  poster_ref: string | null;
  still_ref: string | null;
  backdrop_ref: string | null;
  updated_at: string;
}

export type MediaItem = RecentItem | UpcomingItem | PlayingItem;

export interface SnapshotSection<T extends MediaItem> {
  revision: number;
  updated_at: string;
  stale: boolean;
  partial: boolean;
  items: T[];
}

export interface DashboardSnapshot {
  schema_version: typeof SCHEMA_VERSION;
  entry_id: string;
  revision: number;
  updated_at: string;
  time_zone: string;
  availability: Record<MediaSource, ServiceAvailability>;
  recent: SnapshotSection<RecentItem>;
  upcoming: SnapshotSection<UpcomingItem>;
  playing: SnapshotSection<PlayingItem>;
}

export interface SnapshotEvent {
  type: "snapshot";
  snapshot: DashboardSnapshot;
}

export interface SnapshotPatchEvent {
  schema_version: typeof SCHEMA_VERSION;
  entry_id: string;
  revision: number;
  updated_at: string;
  changes: Partial<Pick<DashboardSnapshot, "availability" | "recent" | "upcoming" | "playing">>;
}
