import { describe, expect, it, vi } from "vitest";

import { OctopusMediaCard } from "../src/octopus-media-card";
import {
  fakeHass,
  playingEmpty,
  playingOne,
  recentEmpty,
  recentThreeMovies,
  snapshotEvent,
} from "./fixtures";
import { ResizeObserverMock } from "./setup";

function configuredCard(): OctopusMediaCard {
  const card = document.createElement("octopus-media-card");
  card.setConfig({ type: "custom:octopus-media-card", entry_id: "fixture_entry_001" });
  return card;
}

describe("octopus media card", () => {
  it("is registered as a custom element with its Lovelace metadata", async () => {
    await import("../src/octopus-media-card");
    expect(customElements.get("octopus-media-card")).toBeDefined();
    expect(window.customCards?.some((card) => card.type === "octopus-media-card")).toBe(true);
  });

  it("provides a scaffold-safe stub and editor", () => {
    expect(OctopusMediaCard.getStubConfig().entry_id).toBe("select_entry");
    expect(OctopusMediaCard.getConfigElement().tagName).toBe("OCTOPUS-MEDIA-EDITOR");
  });

  it("renders loading while a subscription is pending", async () => {
    const card = configuredCard();
    card.hass = fakeHass();
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("octopus-loading-state")).not.toBeNull();
  });

  it("renders empty for a truthful empty snapshot", async () => {
    const card = configuredCard();
    card.hass = fakeHass(snapshotEvent(recentEmpty));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("octopus-empty-state")).not.toBeNull();
  });

  it("renders an error when the subscription fails", async () => {
    const card = configuredCard();
    card.hass = fakeHass(undefined, new Error("fixture subscription failure"));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("octopus-error-state")).not.toBeNull();
  });

  it("renders a functional strip with three fictional items", async () => {
    const card = configuredCard();
    card.hass = fakeHass(snapshotEvent(recentThreeMovies));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    const strip = card.shadowRoot?.querySelector("octopus-media-strip");
    expect(strip).not.toBeNull();
    expect((strip as HTMLElement & { items?: unknown[] }).items).toHaveLength(3);
  });

  it("keeps three compact items inside the constrained composition", async () => {
    const card = document.createElement("octopus-media-card");
    card.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      layout: "compact",
      height: 150,
    });
    card.hass = fakeHass(snapshotEvent(recentThreeMovies));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;

    const compact = card.shadowRoot?.querySelector<HTMLElement>('[data-layout="compact"]');
    expect(compact?.querySelectorAll(".compact-item")).toHaveLength(3);
    expect(compact?.querySelectorAll(".featured")).toHaveLength(1);
  });

  it("applies each LAB visual concept without changing the data path", async () => {
    for (const visualConcept of [
      "cinematic-overlay",
      "gallery-clean",
      "octopus-glass",
      "cinematic-octopus-gallery",
    ] as const) {
      const card = document.createElement("octopus-media-card");
      card.setConfig({
        type: "custom:octopus-media-card",
        entry_id: "fixture_entry_001",
        layout: "strip",
        height: 210,
        visual_concept: visualConcept,
        title_position: visualConcept === "gallery-clean" ? "below" : "overlay",
      });
      card.hass = fakeHass(snapshotEvent(recentThreeMovies));
      document.body.append(card);
      await card.updateComplete;
      await card.updateComplete;
      expect(card.shadowRoot?.querySelector(".card")?.getAttribute("data-concept")).toBe(
        visualConcept,
      );
      expect(card.shadowRoot?.querySelector("octopus-media-strip")).not.toBeNull();
      expect(card.shadowRoot?.querySelector(".ambient-background")).not.toBeNull();
      card.remove();
    }
  });

  it("falls back to the Octopus gradient when focused artwork is unavailable", async () => {
    const card = document.createElement("octopus-media-card");
    card.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      layout: "strip",
      height: 210,
      visual_concept: "cinematic-octopus-gallery",
    });
    card.hass = fakeHass(snapshotEvent(recentEmpty));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector(".ambient-background")).toBeNull();
    expect(card.shadowRoot?.querySelector(".card")?.getAttribute("data-has-ambient")).toBe("false");
  });

  it("coalesces ResizeObserver updates without restarting its subscription", async () => {
    const subscribe = vi.fn();
    const hass = fakeHass(snapshotEvent(recentThreeMovies));
    const originalSubscribe = hass.connection.subscribeMessage.bind(hass.connection);
    hass.connection.subscribeMessage = <T>(
      callback: (message: T) => void,
      message: Record<string, unknown>,
    ) => {
      subscribe();
      return originalSubscribe(callback, message);
    };
    const card = configuredCard();
    card.hass = hass;
    document.body.append(card);
    await card.updateComplete;

    const observer = ResizeObserverMock.instances.at(-1);
    expect(observer).toBeDefined();
    observer?.emit(300, 150);
    observer?.emit(300, 150);
    await new Promise((resolve) => window.setTimeout(resolve, 1));
    await card.updateComplete;

    expect(subscribe).toHaveBeenCalledOnce();
  });

  it("uses the official playing hero without a concept opt-in and reconciles local progress", async () => {
    const card = document.createElement("octopus-media-card");
    card.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "playing",
      layout: "hero",
      height: 240,
    });
    card.hass = fakeHass(snapshotEvent(playingOne));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector("octopus-playing-hero")).not.toBeNull();
    expect(card.shadowRoot?.querySelector("octopus-media-strip")).toBeNull();
    expect(card.shadowRoot?.querySelector(".card")?.getAttribute("data-playing-hero")).toBe("true");
    expect(card.shadowRoot?.querySelector(".card > header")).toBeNull();

    await new Promise((resolve) => window.setTimeout(resolve, 1_050));
    await card.updateComplete;
    const hero = card.shadowRoot?.querySelector("octopus-playing-hero");
    await hero?.updateComplete;
    expect(hero?.items[0]?.position_seconds).toBeGreaterThan(720);

    card.hass = fakeHass(snapshotEvent(playingEmpty));
    card.remove();
  });

  it("freezes local progress for stale playing snapshots", async () => {
    const card = document.createElement("octopus-media-card");
    card.setConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "playing",
      layout: "hero",
      height: 240,
    });
    const stale = {
      ...playingOne,
      playing: { ...playingOne.playing, stale: true },
    };
    card.hass = fakeHass(snapshotEvent(stale));
    document.body.append(card);
    await card.updateComplete;
    await card.updateComplete;
    const hero = card.shadowRoot?.querySelector("octopus-playing-hero");
    const before = hero?.items[0]?.position_seconds;
    await new Promise((resolve) => window.setTimeout(resolve, 1_050));
    await card.updateComplete;
    expect(hero?.items[0]?.position_seconds).toBe(before);
    card.remove();
  });
});
