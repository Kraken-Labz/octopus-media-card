import { describe, expect, it } from "vitest";

import {
  imagePath,
  IMAGE_VARIANTS,
  isOpaqueImageReference,
  PLACEHOLDER_IMAGE,
  SignedPathImageResolver,
} from "../src/image-resolver";
import type { HomeAssistantConnection } from "../src/ha-types";

const REFERENCE = "image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("image resolver contract", () => {
  it("accepts only opaque references", () => {
    expect(isOpaqueImageReference(REFERENCE)).toBe(true);
    expect(isOpaqueImageReference("https://example.test/poster.jpg")).toBe(false);
    expect(isOpaqueImageReference("../poster.jpg")).toBe(false);
  });

  it("builds only the authenticated integration path and closed variants", () => {
    expect(IMAGE_VARIANTS).toEqual([
      "poster-small",
      "poster-medium",
      "poster-large",
      "backdrop-small",
      "backdrop-medium",
    ]);
    expect(imagePath("fixture_entry_001", REFERENCE, "poster-small")).toBe(
      `/api/octopus_media/image/fixture_entry_001/${REFERENCE}/poster-small`,
    );
  });

  it("ships a local data placeholder", () => {
    expect(PLACEHOLDER_IMAGE).toMatch(/^data:image\/svg\+xml(?:;charset=utf-8)?,/);
  });

  it("uses auth/sign_path, deduplicates and never sends Jellyfin data", async () => {
    const calls: Record<string, unknown>[] = [];
    const connection: HomeAssistantConnection = {
      async sendMessagePromise<T>(message: Record<string, unknown>): Promise<T> {
        calls.push(message);
        return { path: `${String(message.path)}?authSig=fixture` } as T;
      },
      subscribeMessage: () => Promise.resolve(() => undefined),
    };
    const resolver = new SignedPathImageResolver(connection);
    const request = {
      entryId: "fixture_entry_001",
      imageRef: REFERENCE,
      variant: "poster-small",
    } as const;
    const [first, second] = await Promise.all([
      resolver.resolve(request),
      resolver.resolve(request),
    ]);
    expect(first).toBe(second);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      type: "auth/sign_path",
      path: imagePath(request.entryId, request.imageRef, request.variant),
      expires: 300,
    });
    expect(JSON.stringify(calls)).not.toMatch(/jellyfin|api.?key|authorization|https?:\/\//i);
    resolver.invalidate(request);
    await resolver.resolve(request);
    expect(calls).toHaveLength(2);
  });
});
