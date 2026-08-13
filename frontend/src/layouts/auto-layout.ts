import type { CardLayout, CardMode } from "../config";

export const AUTO_BREAKPOINTS = [280, 450, 700, 1000] as const;
export const AUTO_HYSTERESIS = 12;

export type AutoBucket = "xs" | "sm" | "md" | "lg" | "xl";

const BUCKETS: readonly AutoBucket[] = ["xs", "sm", "md", "lg", "xl"];

function initialBucket(width: number): AutoBucket {
  if (width < AUTO_BREAKPOINTS[0]) return "xs";
  if (width < AUTO_BREAKPOINTS[1]) return "sm";
  if (width < AUTO_BREAKPOINTS[2]) return "md";
  if (width < AUTO_BREAKPOINTS[3]) return "lg";
  return "xl";
}

export function selectAutoBucket(width: number, previous?: AutoBucket): AutoBucket {
  if (!previous) return initialBucket(width);
  let index = BUCKETS.indexOf(previous);
  while (
    index < AUTO_BREAKPOINTS.length &&
    width >= (AUTO_BREAKPOINTS[index] ?? Number.POSITIVE_INFINITY) + AUTO_HYSTERESIS
  ) {
    index += 1;
  }
  while (
    index > 0 &&
    width < (AUTO_BREAKPOINTS[index - 1] ?? Number.NEGATIVE_INFINITY) - AUTO_HYSTERESIS
  ) {
    index -= 1;
  }
  return BUCKETS[index] ?? "xl";
}

export function layoutForBucket(
  mode: CardMode,
  bucket: AutoBucket,
  height: number,
): Exclude<CardLayout, "auto"> {
  if (bucket === "xs") return mode === "playing" ? "list" : "compact";
  if (bucket === "sm") {
    return mode === "playing" ? (height >= 200 ? "hero" : "compact") : "strip";
  }
  if (bucket === "md") {
    return mode === "playing" ? (height >= 200 ? "hero" : "list") : "strip";
  }
  if (mode === "playing") return "hero";
  return height >= 360 ? "grid" : "strip";
}

export class AutoLayoutController {
  private bucket?: AutoBucket;

  update(mode: CardMode, width: number, height: number): Exclude<CardLayout, "auto"> {
    this.bucket = selectAutoBucket(width, this.bucket);
    return layoutForBucket(mode, this.bucket, height);
  }

  get currentBucket(): AutoBucket | undefined {
    return this.bucket;
  }
}
