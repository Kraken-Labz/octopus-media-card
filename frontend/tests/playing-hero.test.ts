import { describe, expect, it, vi } from "vitest";

import {
  formatEditorialRuntime,
  formatPlaybackTime,
  playingBackgroundArtwork,
  playingEditorialParts,
  playingTechnicalChips,
  type PlayingHero,
} from "../src/components/playing-hero";
import { DEFAULT_CONFIG, type OctopusMediaCardConfig } from "../src/config";
import { translate } from "../src/localization";
import type { PlayingItem } from "../src/models";
import {
  episodePlayingSession,
  fakeHass,
  multiplePlayingSessions,
  onePlayingSession,
  pausedPlayingSession,
} from "./fixtures";

const config: OctopusMediaCardConfig = {
  ...DEFAULT_CONFIG,
  entry_id: "fixture_entry_001",
  mode: "playing",
  layout: "hero",
  height: 240,
};

const firstPlayingSession = onePlayingSession[0];
if (!firstPlayingSession) throw new Error("The playing fixture is incomplete");

async function renderHero(
  items: PlayingItem[],
  options: Partial<Pick<PlayingHero, "heroState" | "partial" | "serviceOffline" | "stale">> = {},
) {
  const element = document.createElement("octopus-playing-hero");
  element.config = config;
  element.entryId = config.entry_id;
  element.hass = fakeHass();
  element.items = items;
  Object.assign(element, options);
  document.body.append(element);
  await element.updateComplete;
  return element;
}

describe("official playing hero", () => {
  it("formats playback time and selects the approved movie and episode artwork", () => {
    expect(formatPlaybackTime(65)).toBe("1:05");
    expect(formatPlaybackTime(3661)).toBe("1:01:01");
    expect(playingBackgroundArtwork(firstPlayingSession)).toEqual({
      ref: firstPlayingSession.backdrop_ref,
      variant: "backdrop-medium",
    });
    expect(playingBackgroundArtwork(episodePlayingSession)).toEqual({
      ref: episodePlayingSession.still_ref,
      variant: "poster-large",
    });
  });

  it("derives bounded wide metadata without inventing fallbacks", () => {
    expect(formatEditorialRuntime(5400)).toBe("1h30");
    expect(formatEditorialRuntime(3120)).toBe("52 min");
    expect(formatEditorialRuntime(0)).toBeUndefined();
    expect(playingEditorialParts(firstPlayingSession, "en-US")).toEqual([
      "2030",
      "1h30",
      "Adventure",
      "Science fiction",
      "★ 8.1",
    ]);
    expect(playingTechnicalChips(firstPlayingSession)).toEqual(["1080p", "HDR", "5.1"]);

    const minimal: PlayingItem = {
      ...firstPlayingSession,
      audio_channels: null,
      duration_seconds: 0,
      genres: [],
      rating: null,
      subtitle: null,
      video_hdr: false,
      video_resolution: null,
    };
    expect(playingEditorialParts(minimal, "en-US")).toEqual([]);
    expect(playingTechnicalChips(minimal)).toEqual([]);
  });

  it("renders playing, paused, stale, partial, movie and episode states", async () => {
    const playing = await renderHero(onePlayingSession, { stale: true, partial: true });
    expect(playing.shadowRoot?.querySelector(".session.playing")).not.toBeNull();
    expect(playing.shadowRoot?.querySelector(".session.stale")).not.toBeNull();
    expect(playing.shadowRoot?.querySelector(".playback-eyebrow")?.textContent).toBe("Now playing");
    const eyebrow = playing.shadowRoot?.querySelector(".playback-eyebrow");
    expect(eyebrow?.tagName).toBe("SPAN");
    expect(eyebrow?.getAttribute("role")).toBeNull();
    expect(eyebrow?.getAttribute("tabindex")).toBeNull();
    expect(playing.shadowRoot?.querySelector("button.playback-eyebrow")).toBeNull();
    expect(playing.shadowRoot?.querySelector("a.playback-eyebrow")).toBeNull();
    expect(playing.shadowRoot?.querySelector(".state-badge.playing")?.textContent).toContain(
      "Playing",
    );
    expect(playing.shadowRoot?.querySelector(".media-kind")?.textContent).toBe("Movie");
    expect(translate("pt-BR", "playingEyebrow")).toBe("EM REPRODUÇÃO");
    expect(playing.shadowRoot?.textContent).toContain("Playing");
    expect(playing.shadowRoot?.textContent).toContain("Last known data");
    expect(playing.shadowRoot?.textContent).toContain("Partial data");
    expect(playing.shadowRoot?.textContent).toContain("Fixture Room");
    expect(playing.shadowRoot?.textContent).toContain("Demo Viewer");
    expect(playing.shadowRoot?.querySelector(".overview")).toBeNull();
    expect(playing.shadowRoot?.querySelector(".editorial-line")?.textContent).not.toContain(
      "Mystery",
    );
    expect(playing.shadowRoot?.querySelectorAll(".technical-chips span")).toHaveLength(3);
    expect(playing.shadowRoot?.querySelector(".session-context .session-meta")).not.toBeNull();
    expect(playing.shadowRoot?.querySelector(".session-context .data-flags")).not.toBeNull();
    expect(playing.shadowRoot?.querySelectorAll(".session-meta ha-icon")).toHaveLength(2);
    expect(playing.shadowRoot?.querySelector("[title]")).toBeNull();
    expect(playing.shadowRoot?.textContent).toContain("12:00");
    expect(playing.shadowRoot?.textContent).toContain("1:30:00");
    expect(
      playing.shadowRoot?.querySelector(".percentage")?.textContent.replace(/\s+/g, " ").trim(),
    ).toBe("13% watched");
    expect(
      playing.shadowRoot?.querySelector(".remaining")?.textContent.replace(/\s+/g, " ").trim(),
    ).toBe("Remaining 1:18:00");

    const paused = await renderHero([pausedPlayingSession]);
    expect(paused.shadowRoot?.querySelector(".session.paused")).not.toBeNull();
    expect(paused.shadowRoot?.textContent).toContain("Paused");

    const episode = await renderHero([episodePlayingSession]);
    expect(episode.shadowRoot?.textContent).toContain("Episode");
    expect(episode.shadowRoot?.textContent).toContain("T02E04 · A Map of Quiet Water");
    expect(episode.shadowRoot?.querySelector(".poster-art")?.getAttribute("imageref")).toBeNull();
  });

  it("distinguishes empty and unavailable states", async () => {
    const empty = await renderHero([], { heroState: "empty" });
    expect(empty.shadowRoot?.textContent).toContain("No active playback");
    expect(empty.shadowRoot?.querySelector(".playing-state.empty")).not.toBeNull();
    expect(empty.shadowRoot?.querySelector("octopus-media-image")).toBeNull();
    expect(empty.shadowRoot?.querySelector("[role=progressbar]")).toBeNull();
    expect(empty.shadowRoot?.querySelector(".session")).toBeNull();

    const unavailable = await renderHero([], {
      heroState: "unavailable",
      serviceOffline: true,
    });
    expect(unavailable.shadowRoot?.textContent).toContain("Jellyfin unavailable");
    expect(unavailable.shadowRoot?.querySelector(".playing-state.unavailable")).not.toBeNull();
  });

  it("hides invalid progress and exposes a clamped progress bar", async () => {
    const withoutDuration = await renderHero([
      { ...firstPlayingSession, duration_seconds: 0, position_seconds: 0, progress: 0 },
    ]);
    expect(withoutDuration.shadowRoot?.querySelector("[role=progressbar]")).toBeNull();

    const clamped = await renderHero([
      { ...firstPlayingSession, position_seconds: 6000, progress: 111 },
    ]);
    expect(
      clamped.shadowRoot?.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow"),
    ).toBe("100");
  });

  it("switches multiple sessions by keyboard and cleans up autoplay", async () => {
    const hero = await renderHero(multiplePlayingSessions);
    const first = hero.shadowRoot?.querySelector<HTMLElement>("[data-session-index='0']");
    first?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    await hero.updateComplete;
    expect(
      hero.shadowRoot?.querySelector("[data-session-index='1']")?.getAttribute("data-active"),
    ).toBe("true");

    const timerHandle = 99 as unknown as ReturnType<typeof window.setInterval>;
    const setInterval = vi.spyOn(window, "setInterval").mockReturnValue(timerHandle);
    const clearInterval = vi.spyOn(window, "clearInterval").mockImplementation(() => undefined);
    hero.config = { ...config, autoplay: true, cycle_interval: 5 };
    await hero.updateComplete;
    expect(setInterval).toHaveBeenCalledOnce();
    hero.remove();
    expect(clearInterval).toHaveBeenCalledWith(timerHandle);
    setInterval.mockRestore();
    clearInterval.mockRestore();
  });
});
