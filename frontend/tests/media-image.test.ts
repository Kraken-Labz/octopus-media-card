import { describe, expect, it } from "vitest";

import "../src/components/media-image";
import type { HomeAssistant } from "../src/ha-types";
import { PLACEHOLDER_IMAGE } from "../src/image-resolver";
import { IntersectionObserverMock } from "./setup";

const REFERENCE = "image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function signedHass(calls: Record<string, unknown>[]): HomeAssistant {
  return {
    config: { time_zone: "Etc/UTC" },
    language: "en",
    connection: {
      async sendMessagePromise<T>(message: Record<string, unknown>): Promise<T> {
        calls.push(message);
        return { path: `${String(message.path)}?authSig=fixture-${String(calls.length)}` } as T;
      },
      subscribeMessage: () => Promise.resolve(() => undefined),
    },
  };
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

describe("media image lazy lifecycle", () => {
  it("signs only after the image enters the prefetch margin", async () => {
    const calls: Record<string, unknown>[] = [];
    const element = document.createElement("octopus-media-image");
    element.hass = signedHass(calls);
    element.entryId = "fixture_entry_001";
    element.imageRef = REFERENCE;
    element.variant = "poster-small";
    document.body.append(element);
    await element.updateComplete;
    expect(calls).toHaveLength(0);
    expect(IntersectionObserverMock.instances[0]?.rootMargin).toBe("180px 180px");
    IntersectionObserverMock.instances[0]?.emit();
    await settle();
    expect(calls).toHaveLength(1);
    const image = element.shadowRoot?.querySelector("img");
    expect(image?.getAttribute("src")).toContain("/api/octopus_media/image/");
    expect(image?.getAttribute("src")).not.toContain("jellyfin");
  });

  it("keeps exact placeholder geometry when no image exists", async () => {
    const calls: Record<string, unknown>[] = [];
    const element = document.createElement("octopus-media-image");
    element.hass = signedHass(calls);
    element.entryId = "fixture_entry_001";
    document.body.append(element);
    await element.updateComplete;
    IntersectionObserverMock.instances[0]?.emit();
    await settle();
    expect(element.shadowRoot?.querySelector("img")?.getAttribute("src")).toBe(PLACEHOLDER_IMAGE);
    expect(calls).toHaveLength(0);
  });

  it("renews at most once after an image load failure and cleans its observer", async () => {
    const calls: Record<string, unknown>[] = [];
    const element = document.createElement("octopus-media-image");
    element.hass = signedHass(calls);
    element.entryId = "fixture_entry_001";
    element.imageRef = REFERENCE;
    document.body.append(element);
    await element.updateComplete;
    const observer = IntersectionObserverMock.instances[0];
    observer?.emit();
    await settle();
    element.shadowRoot?.querySelector("img")?.dispatchEvent(new Event("error"));
    await settle();
    expect(calls).toHaveLength(2);
    element.shadowRoot?.querySelector("img")?.dispatchEvent(new Event("error"));
    await settle();
    expect(calls).toHaveLength(2);
    expect(element.shadowRoot?.querySelector("img")?.getAttribute("src")).toBe(PLACEHOLDER_IMAGE);
    element.remove();
    expect(observer?.disconnected).toBe(true);
  });
});
