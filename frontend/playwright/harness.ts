import "../src/octopus-media-card";
import type { CardLayout, CardMode, VisualConcept } from "../src/config";
import {
  episodeArtworkSnapshot,
  fakeHass,
  jellyfinUnavailable,
  longTitleSnapshot,
  missingImageSnapshot,
  playingEmpty,
  playingEpisode,
  playingLongTitle,
  playingMany,
  playingMinimalMetadata,
  playingMultiple,
  playingOne,
  playingPartial,
  playingPaused,
  playingStale,
  playingGenericDeviceFallback,
  playingWithoutDuration,
  playingWithoutGenres,
  playingWithoutImage,
  playingWithoutRating,
  playingWithoutTechnical,
  recentThreeMovies,
  snapshotEvent,
  staleSnapshot,
  upcomingVisualDesktop,
  upcomingVisualArtwork,
  upcomingVisualOneMissing,
  upcomingVisualEmpty,
  upcomingVisualPartial,
  upcomingVisualStale,
} from "../tests/fixtures";

const root = document.querySelector("#fixture-root");
if (!root) throw new Error("Fixture root is missing");

const params = new URLSearchParams(window.location.search);
const width = Number(params.get("width") ?? 390);
const height = Number(params.get("height") ?? 210);
const mode = (params.get("mode") ?? "recent") as CardMode;
const layout = (params.get("layout") ?? "auto") as CardLayout;
const fixture = params.get("fixture") ?? "recent";
const visualConcept = (params.get("concept") ?? "cinematic-overlay") as VisualConcept;
const titlePosition = params.get("titlePosition") === "below" ? "below" : "overlay";
const requestedFocus = params.get("focus");
const focusIndex = requestedFocus === null ? undefined : Number(requestedFocus);
const itemCount = Number(params.get("itemCount") ?? 12);
const postersVisibleValue = params.get("postersVisible");
const postersVisible =
  postersVisibleValue === null || postersVisibleValue === "auto"
    ? "auto"
    : Number(postersVisibleValue);
const instanceCount = Number(params.get("instances") ?? 1);
const snapshots = {
  episode: episodeArtworkSnapshot,
  long: longTitleSnapshot,
  missing: missingImageSnapshot,
  playing: playingOne,
  playingEmpty,
  playingEpisode,
  playingLong: playingLongTitle,
  playingMany,
  playingMinimal: playingMinimalMetadata,
  playingMissing: playingWithoutImage,
  playingMultiple,
  playingFallback: playingGenericDeviceFallback,
  playingPartial,
  playingPaused,
  playingStale,
  playingZero: playingWithoutDuration,
  playingNoGenres: playingWithoutGenres,
  playingNoRating: playingWithoutRating,
  playingNoTechnical: playingWithoutTechnical,
  recent: recentThreeMovies,
  upcomingDesktop: upcomingVisualDesktop,
  upcomingArtwork: upcomingVisualArtwork,
  upcomingOneMissing: upcomingVisualOneMissing,
  upcomingEmpty: upcomingVisualEmpty,
  upcomingPartial: upcomingVisualPartial,
  upcomingStale: upcomingVisualStale,
  stale: staleSnapshot,
  slow: recentThreeMovies,
  unavailable: jellyfinUnavailable,
};
const selectedSnapshot =
  fixture in snapshots ? snapshots[fixture as keyof typeof snapshots] : recentThreeMovies;

(root as HTMLElement).style.cssText = `display:grid;gap:12px;width:${String(width)}px`;

for (let index = 0; index < instanceCount; index += 1) {
  const card = document.createElement("octopus-media-card");
  card.setConfig({
    type: "custom:octopus-media-card",
    entry_id: "fixture_entry_001",
    mode,
    layout,
    height,
    visual_concept: visualConcept,
    title_position: titlePosition,
    item_count: itemCount,
    posters_visible: postersVisible,
    autoplay: params.get("autoplay") === "true",
    cycle_interval: Number(params.get("cycleInterval") ?? 10),
    show_arrows: params.get("arrows") !== "false",
    show_indicators: params.get("indicators") !== "false",
    show_device: params.get("device") !== "false",
    show_user: params.get("user") !== "false",
    show_progress: params.get("progress") !== "false",
    show_time: params.get("time") !== "false",
  });
  const fixtureHass = fakeHass(snapshotEvent(selectedSnapshot));
  if (mode === "upcoming") fixtureHass.language = "pt-BR";
  card.hass = fixtureHass;
  root.append(card);
}

if (focusIndex !== undefined) {
  const card = document.querySelector("octopus-media-card");
  if (!card) throw new Error("Fixture card is missing");
  void card.updateComplete.then(async () => {
    await card.updateComplete;
    const strip = card.shadowRoot?.querySelector("octopus-media-strip");
    await strip?.updateComplete;
    strip?.shadowRoot?.querySelectorAll<HTMLElement>(".poster")[focusIndex]?.focus();
  });
}
