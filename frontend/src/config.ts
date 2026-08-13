import type { LovelaceCardConfig } from "./ha-types";

export const MODES = ["recent", "upcoming", "playing", "carousel"] as const;
export const LAYOUTS = ["auto", "strip", "grid", "hero", "compact", "portrait", "list"] as const;
export const THEMES = ["auto", "midnight", "ocean", "jellyfin", "neutral"] as const;
export const VISUAL_CONCEPTS = [
  "cinematic-overlay",
  "gallery-clean",
  "octopus-glass",
  "cinematic-octopus-gallery",
  "playing-hero-cinematic",
] as const;

export type CardMode = (typeof MODES)[number];
export type CardLayout = (typeof LAYOUTS)[number];
export type CardTheme = (typeof THEMES)[number];
export type VisualConcept = (typeof VISUAL_CONCEPTS)[number];
export type CardHeight = "auto" | number;

export interface OctopusMediaCardConfig extends LovelaceCardConfig {
  entry_id: string;
  mode: CardMode;
  layout: CardLayout;
  title?: string;
  height: CardHeight;
  sections: Exclude<CardMode, "carousel">[];
  item_count: number;
  posters_visible: "auto" | number;
  density: "auto" | "comfortable" | "compact";
  header_alignment: "start" | "center" | "end";
  theme: CardTheme;
  visual_concept: VisualConcept;
  title_position: "overlay" | "below";
  accent_color?: string;
  autoplay: boolean;
  cycle_interval: number;
  show_arrows: boolean;
  show_indicators: boolean;
  show_titles: boolean;
  show_dates: boolean;
  show_ratings: boolean;
  show_badges: boolean;
  show_device: boolean;
  show_user: boolean;
  show_progress: boolean;
  show_time: boolean;
  thumbnail_size: "small" | "medium" | "large";
}

export const SCAFFOLD_ENTRY_ID = "select_entry";

export const DEFAULT_CONFIG: OctopusMediaCardConfig = {
  type: "custom:octopus-media-card",
  entry_id: SCAFFOLD_ENTRY_ID,
  mode: "recent",
  layout: "auto",
  height: "auto",
  sections: ["recent", "upcoming", "playing"],
  item_count: 12,
  posters_visible: "auto",
  density: "auto",
  header_alignment: "start",
  theme: "midnight",
  visual_concept: "cinematic-overlay",
  title_position: "overlay",
  autoplay: false,
  cycle_interval: 10,
  show_arrows: true,
  show_indicators: true,
  show_titles: true,
  show_dates: true,
  show_ratings: true,
  show_badges: true,
  show_device: true,
  show_user: true,
  show_progress: true,
  show_time: true,
  thumbnail_size: "medium",
};

const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === "string" && values.includes(value as T);

const boundedInteger = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number => {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < minimum || Number(value) > maximum) {
    throw new Error(`Expected an integer between ${String(minimum)} and ${String(maximum)}`);
  }
  return Number(value);
};

export function normalizeConfig(input: unknown): OctopusMediaCardConfig {
  if (typeof input !== "object" || input === null) {
    throw new Error("Card configuration must be an object");
  }
  const value = input as Record<string, unknown>;
  if (value.type !== "custom:octopus-media-card") {
    throw new Error("Invalid card type");
  }
  if (typeof value.entry_id !== "string" || value.entry_id.trim() === "") {
    throw new Error("entry_id is required");
  }
  if (value.mode !== undefined && !isOneOf(value.mode, MODES)) {
    throw new Error("Invalid mode");
  }
  if (value.layout !== undefined && !isOneOf(value.layout, LAYOUTS)) {
    throw new Error("Invalid layout");
  }
  if (value.visual_concept !== undefined && !isOneOf(value.visual_concept, VISUAL_CONCEPTS)) {
    throw new Error("Invalid visual concept");
  }
  if (
    value.title_position !== undefined &&
    !isOneOf(value.title_position, ["overlay", "below"] as const)
  ) {
    throw new Error("Invalid title position");
  }
  const height = value.height ?? DEFAULT_CONFIG.height;
  if (height !== "auto" && (!Number.isFinite(height) || Number(height) < 80)) {
    throw new Error("height must be auto or at least 80 pixels");
  }

  const sections = Array.isArray(value.sections)
    ? value.sections.filter((section): section is "recent" | "upcoming" | "playing" =>
        isOneOf(section, ["recent", "upcoming", "playing"] as const),
      )
    : DEFAULT_CONFIG.sections;

  return {
    ...DEFAULT_CONFIG,
    ...value,
    type: "custom:octopus-media-card",
    entry_id: value.entry_id.trim(),
    mode: value.mode ?? DEFAULT_CONFIG.mode,
    layout: value.layout ?? DEFAULT_CONFIG.layout,
    height,
    sections: sections.length > 0 ? [...sections] : [...DEFAULT_CONFIG.sections],
    item_count: boundedInteger(value.item_count, DEFAULT_CONFIG.item_count, 1, 50),
    cycle_interval: boundedInteger(value.cycle_interval, DEFAULT_CONFIG.cycle_interval, 5, 3600),
    posters_visible:
      value.posters_visible === undefined || value.posters_visible === "auto"
        ? "auto"
        : boundedInteger(value.posters_visible, 3, 1, 5),
  } as OctopusMediaCardConfig;
}
