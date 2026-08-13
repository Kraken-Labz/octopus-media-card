import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

interface FixtureCase {
  concept?: string;
  fixture: string;
  height: number;
  itemCount?: number;
  layout: string;
  mode: string;
  name: string;
  viewportHeight?: number;
  width: number;
}

const stripCases: FixtureCase[] = [
  {
    name: "official-strip-390x210",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
  },
  {
    name: "official-strip-800x240",
    width: 800,
    height: 240,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
  },
  {
    name: "official-strip-819x240",
    width: 819,
    height: 240,
    viewportHeight: 480,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
  },
  {
    name: "official-strip-mobile-390x844",
    width: 390,
    height: 210,
    viewportHeight: 844,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
  },
  {
    name: "official-strip-auto-390",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "auto",
    fixture: "episode",
  },
  {
    name: "official-strip-auto-819",
    width: 819,
    height: 240,
    mode: "recent",
    layout: "auto",
    fixture: "episode",
  },
  {
    name: "official-strip-one-item",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
    itemCount: 1,
  },
  {
    name: "official-strip-two-items",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
    itemCount: 2,
  },
  {
    name: "official-strip-long-title",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "long",
  },
  {
    name: "official-strip-missing-artwork",
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "missing",
  },
  ...(["cinematic-overlay", "gallery-clean", "octopus-glass"] as const).map((concept) => ({
    name: `official-strip-concept-${concept}`,
    width: 390,
    height: 210,
    mode: "recent",
    layout: "strip",
    fixture: "episode",
    concept,
  })),
];

const otherLayoutCases: FixtureCase[] = [
  {
    name: "grid-800x420",
    width: 800,
    height: 420,
    mode: "recent",
    layout: "grid",
    fixture: "episode",
  },
  {
    name: "hero-playing-800x240",
    width: 800,
    height: 240,
    mode: "playing",
    layout: "hero",
    fixture: "playing",
  },
  {
    name: "compact-390x150",
    width: 390,
    height: 150,
    mode: "recent",
    layout: "compact",
    fixture: "recent",
  },
  {
    name: "portrait-390x420",
    width: 390,
    height: 420,
    mode: "recent",
    layout: "portrait",
    fixture: "episode",
  },
  {
    name: "list-playing-390x210",
    width: 390,
    height: 210,
    mode: "playing",
    layout: "list",
    fixture: "playing",
  },
];

function queryFor(fixture: FixtureCase, extras: Record<string, string> = {}): string {
  const query = new URLSearchParams({
    width: String(fixture.width),
    height: String(fixture.height),
    mode: fixture.mode,
    layout: fixture.layout,
    fixture: fixture.fixture,
  });
  if (fixture.concept) query.set("concept", fixture.concept);
  if (fixture.itemCount) query.set("itemCount", String(fixture.itemCount));
  for (const [key, value] of Object.entries(extras)) query.set(key, value);
  return query.toString();
}

async function openFixture(
  page: Page,
  fixture: FixtureCase,
  extras: Record<string, string> = {},
): Promise<void> {
  await page.route("**/api/octopus_media/image/**", async (route) => {
    await route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#152238"/><circle cx="200" cy="245" r="90" fill="#38d5cf"/><path d="M90 520 200 350 310 520Z" fill="#9b6cff"/></svg>',
      contentType: "image/svg+xml",
      status: 200,
    });
  });
  await page.setViewportSize({
    width: Math.max(fixture.width, 320),
    height: fixture.viewportHeight ?? Math.max(fixture.height + 40, 320),
  });
  await page.goto(`/playwright/harness.html?${queryFor(fixture, extras)}`);
  await expect(page.locator("octopus-media-card").first()).toBeVisible();
}

async function stripGeometry(page: Page) {
  return page
    .locator("octopus-media-strip")
    .first()
    .evaluate((element) => {
      const track = element.shadowRoot?.querySelector<HTMLElement>(".track");
      const posters = [...(element.shadowRoot?.querySelectorAll<HTMLElement>(".poster") ?? [])];
      const first = posters[0];
      if (!track || !first) throw new Error("Official strip geometry unavailable");
      const viewport = track.getBoundingClientRect();
      const rects = posters.map((poster) => poster.getBoundingClientRect());
      const posterStyle = getComputedStyle(first);
      const complete = rects.filter((rect) => rect.right <= viewport.right + 0.5).length;
      const partial = rects[complete];
      const previous = element.shadowRoot?.querySelector<HTMLButtonElement>(".previous");
      const next = element.shadowRoot?.querySelector<HTMLButtonElement>(".next");
      return {
        complete,
        gap: Number.parseFloat(getComputedStyle(track).columnGap),
        nextFraction: partial
          ? Math.max(0, viewport.right - partial.left) / Math.max(1, partial.width)
          : 0,
        posterHeight: Number.parseFloat(posterStyle.height),
        posterWidth: Number.parseFloat(posterStyle.width),
        previousVisible: previous ? !previous.hidden : false,
        nextVisible: next ? !next.hidden : false,
        scrollLeft: track.scrollLeft,
        scrollWidth: track.scrollWidth,
        clientWidth: track.clientWidth,
      };
    });
}

for (const fixture of stripCases) {
  test(`${fixture.name} uses the consolidated official strip`, async ({ page }) => {
    await openFixture(page, fixture);
    const card = page.locator("octopus-media-card").first();
    await expect(card.locator("octopus-media-strip")).toBeVisible();
    await expect(card.locator("octopus-media-d2-card")).toHaveCount(0);
    await expect(card.locator("octopus-media-shelf")).toHaveCount(0);
    await expect(card.locator('.card[data-layout="strip"]')).toBeVisible();

    const geometry = await stripGeometry(page);
    expect(geometry.posterWidth / geometry.posterHeight).toBeCloseTo(2 / 3, 2);
    expect(geometry.scrollLeft).toBe(0);
    expect(geometry.previousVisible).toBe(false);
    if ((fixture.itemCount ?? 12) > 2) {
      const narrow = fixture.width < 560;
      expect(geometry.complete).toBe(narrow ? 3 : 5);
      expect(geometry.gap).toBeCloseTo(narrow ? 10 : 12, 1);
      expect(geometry.nextFraction).toBeGreaterThanOrEqual(0.15);
      expect(geometry.nextFraction).toBeLessThanOrEqual(0.3);
    } else {
      expect(geometry.complete).toBe(fixture.itemCount);
      expect(geometry.nextFraction).toBe(0);
      expect(geometry.nextVisible).toBe(false);
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    }

    const article = card.locator(".card");
    const containment = await article.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(containment.scrollHeight).toBeLessThanOrEqual(containment.clientHeight);

    const evidenceRoot = process.env.OCTOPUS_PRIVATE_SCREENSHOTS;
    if (evidenceRoot) {
      await card.screenshot({ path: path.join(evidenceRoot, `${fixture.name}.png`) });
    }
  });
}

test("hover and keyboard focus share the approved hierarchy and secure backdrop", async ({
  page,
}) => {
  const fixture = stripCases[0];
  if (!fixture) throw new Error("Official strip fixture missing");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await openFixture(page, fixture);
  const card = page.locator("octopus-media-card");
  const second = card.locator("octopus-media-strip").locator(".poster").nth(1);
  const before = await second.evaluate((element) => ({
    shadow: getComputedStyle(element.querySelector(".frame") ?? element).boxShadow,
    transform: getComputedStyle(element).transform,
  }));
  await second.hover();
  await expect(second).toHaveAttribute("data-focused", "true");
  const hover = await second.evaluate((element) => ({
    shadow: getComputedStyle(element.querySelector(".frame") ?? element).boxShadow,
    transform: getComputedStyle(element).transform,
  }));
  expect(hover.transform).not.toBe(before.transform);
  expect(hover.shadow).not.toBe(before.shadow);
  await second.focus();
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("data-focused", "true");
  await expect(second).not.toHaveAttribute("title", /.+/);
  await expect(second).toHaveAttribute("aria-label", /.+/);
  await expect(
    card.locator(".ambient-background").locator('img[data-state="loaded"]'),
  ).toBeVisible();
  expect(requests.some((url) => /jellyfin|api.?key|authorization/i.test(url))).toBe(false);
  expect(requests.some((url) => url.includes("/api/octopus_media/image/"))).toBe(true);
});

test("touch click produces the same focused state", async ({ page }) => {
  const fixture = stripCases[0];
  if (!fixture) throw new Error("Official strip fixture missing");
  await openFixture(page, fixture);
  const second = page.locator("octopus-media-strip").locator(".poster").nth(1);
  await second.click();
  await expect(second).toHaveAttribute("data-focused", "true");
});

test("navigation reaches the end and returns without changing track geometry", async ({ page }) => {
  const fixture = stripCases[1];
  if (!fixture) throw new Error("Wide official strip fixture missing");
  await openFixture(page, fixture);
  const strip = page.locator("octopus-media-strip");
  const initial = await stripGeometry(page);
  await strip.evaluate((element) => {
    const track = element.shadowRoot?.querySelector<HTMLElement>(".track");
    if (!track) throw new Error("Track missing");
    track.scrollLeft = track.scrollWidth;
    track.dispatchEvent(new Event("scroll"));
  });
  await expect
    .poll(() =>
      strip.evaluate(
        (element) => !element.shadowRoot?.querySelector<HTMLButtonElement>(".previous")?.hidden,
      ),
    )
    .toBe(true);
  await strip.evaluate((element) => {
    const track = element.shadowRoot?.querySelector<HTMLElement>(".track");
    if (!track) throw new Error("Track missing");
    track.scrollLeft = 0;
    track.dispatchEvent(new Event("scroll"));
  });
  await expect
    .poll(() =>
      strip.evaluate(
        (element) =>
          element.shadowRoot?.querySelector<HTMLButtonElement>(".previous")?.hidden ?? false,
      ),
    )
    .toBe(true);
  const restored = await stripGeometry(page);
  expect(restored.posterWidth).toBeCloseTo(initial.posterWidth, 2);
  expect(restored.posterHeight).toBeCloseTo(initial.posterHeight, 2);
});

test("multiple strip instances initialize independently at the start", async ({ page }) => {
  const fixture = stripCases[0];
  if (!fixture) throw new Error("Official strip fixture missing");
  await openFixture(page, fixture, { instances: "2" });
  await expect(page.locator("octopus-media-card")).toHaveCount(2);
  const states = await page.locator("octopus-media-strip").evaluateAll((elements) =>
    elements.map((element) => {
      const track = element.shadowRoot?.querySelector<HTMLElement>(".track");
      const previous = element.shadowRoot?.querySelector<HTMLButtonElement>(".previous");
      return { scrollLeft: track?.scrollLeft ?? -1, previousHidden: previous?.hidden ?? false };
    }),
  );
  expect(states).toEqual([
    { scrollLeft: 0, previousHidden: true },
    { scrollLeft: 0, previousHidden: true },
  ]);
});

test("125 percent zoom and device scale 1.25 preserve strip containment", async ({
  browser,
  page,
}) => {
  const fixture = stripCases[0];
  if (!fixture) throw new Error("Official strip fixture missing");
  await page.setViewportSize({ width: 488, height: 263 });
  await openFixture(page, fixture);
  await page.evaluate(() => {
    document.body.style.zoom = "1.25";
  });
  const zoomOverflow = await page.locator(".card").evaluate((element) => ({
    client: element.clientHeight,
    scroll: element.scrollHeight,
  }));
  expect(zoomOverflow.scroll).toBeLessThanOrEqual(zoomOverflow.client);

  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    deviceScaleFactor: 1.25,
    viewport: { width: 390, height: 844 },
  });
  const scaledPage = await context.newPage();
  await openFixture(scaledPage, fixture);
  const scaled = await stripGeometry(scaledPage);
  expect(scaled.posterWidth / scaled.posterHeight).toBeCloseTo(2 / 3, 2);
  await context.close();
});

for (const fixture of otherLayoutCases) {
  test(`${fixture.name} remains available after strip consolidation`, async ({ page }) => {
    await openFixture(page, fixture);
    const card = page.locator("octopus-media-card");
    await expect(card.locator(`.card[data-layout="${fixture.layout}"]`)).toBeVisible();
    await expect(card.locator("octopus-media-strip")).toHaveCount(0);
    const containment = await card.locator(".card").evaluate((element) => ({
      client: element.clientHeight,
      scroll: element.scrollHeight,
    }));
    expect(containment.scroll).toBeLessThanOrEqual(containment.client);
  });
}
