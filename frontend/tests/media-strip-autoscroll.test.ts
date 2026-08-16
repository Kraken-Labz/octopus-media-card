import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/components/media-strip";
import type { MediaStrip } from "../src/components/media-strip";
import { threeRecentMovies } from "./fixtures";

function setupStrip(autoScroll = true): MediaStrip {
  const strip = document.createElement("octopus-media-strip");
  strip.items = [...threeRecentMovies, ...threeRecentMovies];
  strip.autoScroll = autoScroll;
  strip.autoScrollInterval = 2;
  document.body.append(strip);
  return strip;
}

async function sizeStrip(strip: MediaStrip): Promise<HTMLElement> {
  await strip.updateComplete;
  const track = strip.shadowRoot?.querySelector<HTMLElement>(".track");
  const poster = strip.shadowRoot?.querySelector<HTMLElement>(".poster");
  if (!track || !poster) throw new Error("strip geometry missing");
  Object.defineProperties(track, {
    clientWidth: { configurable: true, value: 300 },
    scrollWidth: { configurable: true, value: 900 },
    scrollLeft: { configurable: true, writable: true, value: 0 },
  });
  Object.defineProperty(poster, "offsetWidth", { configurable: true, value: 100 });
  Object.defineProperty(track, "scrollTo", { configurable: true, value: vi.fn() });
  const enabled = strip.autoScroll;
  strip.autoScroll = false;
  await strip.updateComplete;
  strip.autoScroll = enabled;
  await strip.updateComplete;
  return track;
}

describe("media strip auto-scroll", () => {
  afterEach(() => vi.restoreAllMocks());

  function timerHarness() {
    let callback: (() => void) | undefined;
    const interval = vi.spyOn(window, "setInterval").mockImplementation(((fn: TimerHandler) => {
      callback = fn as () => void;
      return 1;
    }) as typeof window.setInterval);
    return { callback: () => callback?.(), interval };
  }

  it("is disabled by default", async () => {
    const { interval } = timerHarness();
    const strip = setupStrip(false);
    await sizeStrip(strip);
    expect(interval).not.toHaveBeenCalled();
    expect(strip.shadowRoot?.querySelector<HTMLElement>(".track")?.scrollTo).not.toHaveBeenCalled();
  });

  it("advances one item per interval and loops", async () => {
    const timer = timerHarness();
    const strip = setupStrip();
    const track = await sizeStrip(strip);
    timer.callback();
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 110, behavior: "smooth" });
    Object.defineProperty(track, "scrollLeft", { configurable: true, value: 500 });
    timer.callback();
    expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
  });

  it("pauses on hover and focus, then resumes after interaction", async () => {
    const timer = timerHarness();
    const clearInterval = vi.spyOn(window, "clearInterval");
    const strip = setupStrip();
    const track = await sizeStrip(strip);
    track.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    expect(clearInterval).toHaveBeenCalled();
    expect(track.scrollTo).not.toHaveBeenCalled();
    track.dispatchEvent(new Event("pointerleave", { bubbles: true }));
    timer.callback();
    expect(track.scrollTo).toHaveBeenCalledOnce();
    const poster = strip.shadowRoot?.querySelector<HTMLButtonElement>(".poster");
    poster?.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(clearInterval).toHaveBeenCalledTimes(2);
    expect(track.scrollTo).toHaveBeenCalledOnce();
  });

  it("cleans up its timer when disconnected", async () => {
    const timer = timerHarness();
    const clearInterval = vi.spyOn(window, "clearInterval");
    const strip = setupStrip();
    const track = await sizeStrip(strip);
    strip.remove();
    expect(clearInterval).toHaveBeenCalled();
    expect(timer.interval).toHaveBeenCalled();
    expect(track.scrollTo).not.toHaveBeenCalled();
  });
});
