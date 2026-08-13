import { describe, expect, it } from "vitest";

import {
  AUTO_HYSTERESIS,
  AutoLayoutController,
  layoutForBucket,
  selectAutoBucket,
} from "../src/layouts/auto-layout";

describe("automatic layout", () => {
  it("selects strip for a 390 × 210 recent card", () => {
    const controller = new AutoLayoutController();
    expect(controller.update("recent", 390, 210)).toBe("strip");
    expect(controller.currentBucket).toBe("sm");
  });

  it("keeps the previous bucket inside the hysteresis band", () => {
    expect(selectAutoBucket(449, "sm")).toBe("sm");
    expect(selectAutoBucket(450 + AUTO_HYSTERESIS - 1, "sm")).toBe("sm");
    expect(selectAutoBucket(450 + AUTO_HYSTERESIS, "sm")).toBe("md");
    expect(selectAutoBucket(450 - AUTO_HYSTERESIS, "md")).toBe("md");
    expect(selectAutoBucket(450 - AUTO_HYSTERESIS - 1, "md")).toBe("sm");
  });

  it("uses a height-aware playing layout", () => {
    expect(layoutForBucket("playing", "sm", 240)).toBe("hero");
    expect(layoutForBucket("playing", "sm", 160)).toBe("compact");
    expect(layoutForBucket("playing", "md", 210)).toBe("hero");
    expect(layoutForBucket("playing", "md", 160)).toBe("list");
  });

  it("selects hero for documented compact and wide playing cards", () => {
    expect(new AutoLayoutController().update("playing", 390, 240)).toBe("hero");
    expect(new AutoLayoutController().update("playing", 800, 240)).toBe("hero");
  });
});
