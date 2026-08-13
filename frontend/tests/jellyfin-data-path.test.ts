import { afterEach, describe, expect, it, vi } from "vitest";

import type { HomeAssistant, UnsubscribeFunc } from "../src/ha-types";
import { OctopusMediaCard } from "../src/octopus-media-card";
import type { DashboardSnapshot, SnapshotEvent } from "../src/models";
import {
  jellyfinUnavailable,
  playingEmpty,
  playingOne,
  recentThreeMovies,
  snapshotEvent,
} from "./fixtures";

function card(mode: "recent" | "upcoming" | "playing", layout = "strip"): OctopusMediaCard {
  const element = new OctopusMediaCard();
  element.setConfig({
    type: "custom:octopus-media-card",
    entry_id: "fixture_entry_001",
    mode,
    layout,
  });
  return element;
}

function controlledHass() {
  let callback: ((event: SnapshotEvent) => void) | undefined;
  const unsubscribe = vi.fn();
  const subscribe = vi.fn();
  const hass: HomeAssistant = {
    config: { time_zone: "Etc/UTC" },
    language: "en",
    connection: {
      sendMessagePromise<T>(): Promise<T> {
        return Promise.resolve({ entries: [] } as T);
      },
      subscribeMessage<T>(next: (event: T) => void): Promise<UnsubscribeFunc> {
        subscribe();
        callback = next as (event: SnapshotEvent) => void;
        return Promise.resolve(unsubscribe);
      },
    },
  };
  return {
    emit(snapshot: DashboardSnapshot) {
      callback?.(snapshotEvent(snapshot));
    },
    hass,
    subscribe,
    unsubscribe,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Jellyfin data path states", () => {
  it("distinguishes active-playing empty from unavailable", async () => {
    const control = controlledHass();
    const element = card("playing");
    element.hass = control.hass;
    document.body.append(element);
    control.emit(playingEmpty);
    await element.updateComplete;
    expect(
      element.shadowRoot?.querySelector("octopus-empty-state")?.shadowRoot?.textContent,
    ).toContain("No active playback");

    control.emit(jellyfinUnavailable);
    await element.updateComplete;
    expect(
      element.shadowRoot?.querySelector("octopus-error-state")?.shadowRoot?.textContent,
    ).toContain("Jellyfin is currently unavailable");
  });

  it("shows upcoming as future setup without a global error", async () => {
    const control = controlledHass();
    const element = card("upcoming");
    element.hass = control.hass;
    document.body.append(element);
    control.emit(recentThreeMovies);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector("octopus-error-state")).toBeNull();
    expect(
      element.shadowRoot?.querySelector("octopus-empty-state")?.shadowRoot?.textContent,
    ).toContain("future setup phase");
  });

  it("renders stale and partial indicators alongside preserved recent data", async () => {
    const control = controlledHass();
    const element = card("recent");
    element.hass = control.hass;
    document.body.append(element);
    control.emit({
      ...recentThreeMovies,
      recent: { ...recentThreeMovies.recent, stale: true, partial: true },
    });
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector(".stale")?.textContent).toContain("last available");
    expect(element.shadowRoot?.querySelector(".partial")?.textContent).toContain("could not");
    const strip = element.shadowRoot?.querySelector("octopus-media-strip");
    expect(strip?.items).toHaveLength(3);
  });

  it("advances playing progress locally and corrects it on the next snapshot", async () => {
    vi.useFakeTimers({
      toFake: ["Date", "setInterval", "clearInterval", "setTimeout", "clearTimeout"],
    });
    vi.setSystemTime(new Date("2030-04-05T12:00:00Z"));
    const control = controlledHass();
    const element = card("playing", "hero");
    element.hass = control.hass;
    document.body.append(element);
    control.emit(playingOne);
    await element.updateComplete;
    const hero = element.shadowRoot?.querySelector("octopus-playing-hero");
    if (!hero) throw new Error("Official Playing Hero was not rendered");
    await hero.updateComplete;
    const progressValue = () => hero.items[0]?.progress;
    expect(progressValue()).toBeCloseTo(13.3333);

    await vi.advanceTimersByTimeAsync(2000);
    await element.updateComplete;
    await hero.updateComplete;
    expect(progressValue()).toBeGreaterThan(13.3333);

    const correctedItem = playingOne.playing.items[0];
    if (!correctedItem) throw new Error("Missing playing fixture");
    control.emit({
      ...playingOne,
      revision: playingOne.revision + 1,
      playing: {
        ...playingOne.playing,
        revision: playingOne.playing.revision + 1,
        items: [{ ...correctedItem, position_seconds: 2700, progress: 50 }],
      },
    });
    await element.updateComplete;
    await hero.updateComplete;
    expect(progressValue()).toBe(50);
  });

  it("retries a failed initial subscription and renders after reconnect", async () => {
    vi.useFakeTimers({
      toFake: ["Date", "setInterval", "clearInterval", "setTimeout", "clearTimeout"],
    });
    let attempts = 0;
    const hass: HomeAssistant = {
      config: { time_zone: "Etc/UTC" },
      language: "en",
      connection: {
        sendMessagePromise<T>(): Promise<T> {
          return Promise.resolve({ entries: [] } as T);
        },
        subscribeMessage<T>(callback: (message: T) => void): Promise<UnsubscribeFunc> {
          attempts += 1;
          if (attempts === 1) return Promise.reject(new Error("fixture disconnect"));
          callback(snapshotEvent(recentThreeMovies) as T);
          return Promise.resolve(() => undefined);
        },
      },
    };
    const element = card("recent");
    element.hass = hass;
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();
    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(1000);
    await element.updateComplete;
    expect(attempts).toBe(2);
    const strip = element.shadowRoot?.querySelector("octopus-media-strip");
    expect(strip?.items).toHaveLength(3);
  });

  it("unsubscribes and stops timers when disconnected", async () => {
    const control = controlledHass();
    const element = card("playing", "hero");
    element.hass = control.hass;
    document.body.append(element);
    control.emit(playingOne);
    await element.updateComplete;
    element.remove();
    expect(control.unsubscribe).toHaveBeenCalledOnce();
  });
});
