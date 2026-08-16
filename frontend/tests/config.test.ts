import { describe, expect, it } from "vitest";

import { normalizeConfig } from "../src/config";

describe("normalizeConfig", () => {
  it("accepts the minimal documented configuration", () => {
    const config = normalizeConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
    });
    expect(config.mode).toBe("recent");
    expect(config.layout).toBe("auto");
    expect(config.item_count).toBe(12);
    expect(config.visual_concept).toBe("cinematic-overlay");
    expect(config.title_position).toBe("overlay");
    expect(config.show_device).toBe(true);
    expect(config.show_user).toBe(true);
    expect(config.show_progress).toBe(true);
    expect(config.show_time).toBe(true);
    expect(config.appearance).toBe("auto");
    expect(config.auto_scroll).toBe(false);
    expect(config.auto_scroll_interval).toBe(6);
  });

  it.each(["dark", "light", "auto"] as const)("accepts appearance %s", (appearance) => {
    expect(
      normalizeConfig({
        type: "custom:octopus-media-card",
        entry_id: "fixture_entry_001",
        appearance,
      }).appearance,
    ).toBe(appearance);
  });

  it("accepts the playing hero YAML contract", () => {
    const config = normalizeConfig({
      type: "custom:octopus-media-card",
      entry_id: "fixture_entry_001",
      mode: "playing",
      layout: "hero",
      height: 240,
      show_titles: true,
      show_badges: true,
      show_device: true,
      show_user: true,
      show_progress: true,
      show_time: true,
    });
    expect(config.visual_concept).toBe("cinematic-overlay");
    expect(config.height).toBe(240);
  });

  it.each([
    null,
    {},
    { type: "custom:wrong-card", entry_id: "fixture_entry_001" },
    { type: "custom:octopus-media-card", entry_id: "" },
    { type: "custom:octopus-media-card", entry_id: "fixture", mode: "invalid" },
    { type: "custom:octopus-media-card", entry_id: "fixture", layout: "invalid" },
    { type: "custom:octopus-media-card", entry_id: "fixture", visual_concept: "invalid" },
    { type: "custom:octopus-media-card", entry_id: "fixture", title_position: "invalid" },
  ])("rejects invalid configuration %#", (value) => {
    expect(() => normalizeConfig(value)).toThrow();
  });
});
