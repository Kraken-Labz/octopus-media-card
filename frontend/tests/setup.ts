import { afterEach } from "vitest";

class ResizeObserverMock implements ResizeObserver {
  static instances: ResizeObserverMock[] = [];

  readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}

  emit(width: number, height: number): void {
    const entry = {
      contentBoxSize: [{ blockSize: height, inlineSize: width }],
      contentRect: {
        bottom: height,
        height,
        left: 0,
        right: width,
        top: 0,
        width,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      },
      devicePixelContentBoxSize: [],
      borderBoxSize: [],
      target: document.createElement("div"),
    } satisfies ResizeObserverEntry;
    this.callback([entry], this);
  }
}

class IntersectionObserverMock implements IntersectionObserver {
  static instances: IntersectionObserverMock[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly callback: IntersectionObserverCallback;
  readonly targets = new Set<Element>();
  disconnected = false;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
    IntersectionObserverMock.instances.push(this);
  }

  disconnect(): void {
    this.disconnected = true;
    this.targets.clear();
  }
  observe(target: Element): void {
    this.targets.add(target);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  emit(isIntersecting = true): void {
    const entries = [...this.targets].map(
      (target) =>
        ({
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting,
          rootBounds: null,
          target,
          time: 0,
        }) satisfies IntersectionObserverEntry,
    );
    this.callback(entries, this);
  }
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverMock,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  value: IntersectionObserverMock,
});
Object.defineProperty(globalThis, "requestAnimationFrame", {
  configurable: true,
  value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0),
});
Object.defineProperty(globalThis, "cancelAnimationFrame", {
  configurable: true,
  value: (handle: number) => window.clearTimeout(handle),
});

afterEach(() => {
  document.body.replaceChildren();
  window.customCards = [];
  ResizeObserverMock.instances.length = 0;
  IntersectionObserverMock.instances.length = 0;
});

export { IntersectionObserverMock, ResizeObserverMock };
