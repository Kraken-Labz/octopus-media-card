import { describe, expect, it } from "vitest";

import { calculateStripGeometry } from "../src/layouts/strip-geometry";

describe("official strip geometry", () => {
  it.each([
    { height: 210, width: 390, full: 3, gap: 10, posterHeight: 159.32 },
    { height: 240, width: 800, full: 5, gap: 12, posterHeight: 192.53 },
    { height: 240, width: 819, full: 5, gap: 12, posterHeight: 197.99 },
  ])(
    "keeps the approved geometry at $width by $height",
    ({ full, gap, height, posterHeight, width }) => {
      const geometry = calculateStripGeometry(width, height, "auto", 12);

      expect(geometry.posterWidth / geometry.posterHeight).toBeCloseTo(2 / 3, 8);
      expect(geometry.visibleFullItems).toBe(full);
      expect(geometry.gap).toBe(gap);
      expect(geometry.posterHeight).toBeCloseTo(posterHeight, 1);
      expect(geometry.peekFraction).toBeCloseTo(0.22, 2);
    },
  );

  it("treats posters_visible as a target while fixed height keeps 2:3 authoritative", () => {
    const geometry = calculateStripGeometry(800, 240, 4, 12);

    expect(geometry.visibleFullItems).toBe(5);
    expect(geometry.posterWidth / geometry.posterHeight).toBeCloseTo(2 / 3, 8);
    expect(geometry.posterHeight).toBeCloseTo(192.53, 1);
    expect(geometry.peekFraction).toBeCloseTo(0.22, 2);
  });

  it.each([1, 2])("keeps %s-item collections left aligned with no synthetic peek", (itemCount) => {
    const geometry = calculateStripGeometry(390, 210, "auto", itemCount);

    expect(geometry.visibleFullItems).toBe(itemCount);
    expect(geometry.peekWidth).toBe(0);
    expect(geometry.posterWidth / geometry.posterHeight).toBeCloseTo(2 / 3, 8);
  });
});
