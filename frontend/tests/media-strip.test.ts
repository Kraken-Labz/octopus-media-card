import { describe, expect, it } from "vitest";

import "../src/components/media-strip";
import { episodeArtworkSnapshot, fakeHass, upcomingVisualDesktop } from "./fixtures";

describe("official media strip", () => {
  it("renders Upcoming through the shared portrait strip primitive", async () => {
    const strip = document.createElement("octopus-media-strip");
    strip.variant = "upcoming";
    strip.items = [
      {
        ref: "upcoming-test",
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
        poster_ref: "image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        all_day: true,
      },
    ];
    document.body.append(strip);
    await strip.updateComplete;
    expect(strip.shadowRoot?.querySelector(".poster")).not.toBeNull();
    expect(strip.shadowRoot?.textContent).toContain("Tomorrow");
  });
  it("renders complete fictional items with overlay copy and no native tooltip", async () => {
    const strip = document.createElement("octopus-media-strip");
    strip.items = episodeArtworkSnapshot.recent.items;
    strip.entryId = "fixture_entry_001";
    strip.hass = fakeHass();
    strip.focusedRef = strip.items[0]?.ref;
    document.body.append(strip);
    await strip.updateComplete;

    const posters = strip.shadowRoot?.querySelectorAll(".poster");
    expect(posters).toHaveLength(7);
    expect(strip.shadowRoot?.querySelector(".badge")).toBeNull();
    expect(posters?.[0]?.hasAttribute("title")).toBe(false);
    expect(posters?.[0]?.getAttribute("aria-label")).toContain("Harbor of Small Comets");
    expect(strip.shadowRoot?.querySelector(".copy-gradient")).not.toBeNull();
  });

  it("keeps Upcoming episode titles tertiary and hides them in compact mode", async () => {
    const strip = document.createElement("octopus-media-strip");
    strip.variant = "upcoming";
    const episode = upcomingVisualDesktop.upcoming.items[1];
    if (!episode) throw new Error("Upcoming episode fixture missing");
    strip.items = [episode];
    document.body.append(strip);
    await strip.updateComplete;
    expect(strip.shadowRoot?.querySelector(".episode-subtitle")).toBeNull();

    strip.wide = true;
    await strip.updateComplete;
    expect(strip.shadowRoot?.querySelector(".episode-subtitle")?.textContent).toContain(
      "A Map of Quiet Water",
    );
    expect(strip.shadowRoot?.querySelector(".badge")).toBeNull();
  });

  it("announces equivalent focus from keyboard and touch click", async () => {
    const strip = document.createElement("octopus-media-strip");
    strip.items = episodeArtworkSnapshot.recent.items;
    document.body.append(strip);
    await strip.updateComplete;
    const second = strip.shadowRoot?.querySelectorAll<HTMLButtonElement>(".poster")[1];
    if (!second) throw new Error("Fixture poster missing");

    const keyboard = new Promise<CustomEvent>((resolve) => {
      strip.addEventListener("octopus-media-focus", (event) => resolve(event as CustomEvent), {
        once: true,
      });
    });
    second.focus();
    await expect(keyboard).resolves.toMatchObject({
      detail: { ref: episodeArtworkSnapshot.recent.items[1]?.ref },
    });

    strip.focusedRef = strip.items[0]?.ref;
    await strip.updateComplete;
    const touch = new Promise<CustomEvent>((resolve) => {
      strip.addEventListener("octopus-media-focus", (event) => resolve(event as CustomEvent), {
        once: true,
      });
    });
    second.click();
    await expect(touch).resolves.toMatchObject({
      detail: { ref: episodeArtworkSnapshot.recent.items[1]?.ref },
    });
  });
});
