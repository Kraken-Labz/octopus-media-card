import { describe, expect, it } from "vitest";

import "../src/components/media-poster";
import { MediaPoster } from "../src/components/media-poster";
import { extremelyLongTitle, missingImageSnapshot } from "./fixtures";

describe("poster component", () => {
  it("renders a missing image with the local placeholder", async () => {
    const poster = document.createElement("octopus-media-poster");
    poster.item = missingImageSnapshot.recent.items[0];
    document.body.append(poster);
    await poster.updateComplete;
    const mediaImage = poster.shadowRoot?.querySelector("octopus-media-image");
    await mediaImage?.updateComplete;
    expect(mediaImage?.shadowRoot?.querySelector("img")?.src).toContain("data:image/svg+xml");
  });

  it("keeps extremely long titles and applies a two-line clamp", async () => {
    const poster = document.createElement("octopus-media-poster");
    const item = missingImageSnapshot.recent.items[0];
    if (!item) throw new Error("Missing static poster fixture");
    poster.item = { ...item, title: extremelyLongTitle };
    document.body.append(poster);
    await poster.updateComplete;
    expect(poster.shadowRoot?.querySelector(".title")?.textContent).toBe(extremelyLongTitle);
    expect(MediaPoster.styles.cssText).toContain("-webkit-line-clamp: 2");
  });

  it("renders overlay and below title variants accessibly", async () => {
    const item = missingImageSnapshot.recent.items[0];
    if (!item) throw new Error("Missing static poster fixture");
    const poster = document.createElement("octopus-media-poster");
    poster.item = item;
    poster.titlePosition = "overlay";
    document.body.append(poster);
    await poster.updateComplete;
    expect(poster.shadowRoot?.querySelector(".overlay-copy .title")?.textContent).toBe(item.title);
    expect(poster.shadowRoot?.querySelector("article")?.getAttribute("aria-label")).toBe(
      item.title,
    );
    poster.titlePosition = "below";
    await poster.updateComplete;
    expect(poster.shadowRoot?.querySelector(".overlay-copy")).toBeNull();
    expect(poster.shadowRoot?.querySelector(".image-frame + .title")?.textContent).toBe(item.title);
  });

  it("announces keyboard and touch focus without requiring hover", async () => {
    const item = missingImageSnapshot.recent.items[0];
    if (!item) throw new Error("Missing static poster fixture");
    const poster = document.createElement("octopus-media-poster");
    poster.item = item;
    poster.itemIndex = 2;
    document.body.append(poster);
    await poster.updateComplete;
    const focus = new Promise<CustomEvent>((resolve) => {
      poster.addEventListener("octopus-media-focus", (event) => resolve(event as CustomEvent), {
        once: true,
      });
    });
    poster.shadowRoot?.querySelector<HTMLElement>("article")?.focus();
    await expect(focus).resolves.toMatchObject({ detail: { index: 2, ref: item.ref } });
  });
});
