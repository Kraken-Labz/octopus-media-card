import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

interface HeroCase {
  evidence?: boolean;
  fixture: string;
  height: number;
  name: string;
  viewportHeight?: number;
  width: number;
}

const cases: HeroCase[] = [
  {
    name: "playing-hero-metadata-390x240",
    width: 390,
    height: 240,
    fixture: "playing",
    evidence: true,
  },
  {
    name: "playing-hero-metadata-600x240",
    width: 600,
    height: 240,
    fixture: "playing",
    evidence: true,
  },
  {
    name: "playing-hero-metadata-800x240",
    width: 800,
    height: 240,
    fixture: "playing",
    evidence: true,
  },
  {
    name: "playing-hero-819x480",
    width: 819,
    height: 240,
    viewportHeight: 480,
    fixture: "playing",
  },
  {
    name: "playing-hero-mobile-390x844",
    width: 390,
    height: 240,
    viewportHeight: 844,
    fixture: "playing",
  },
  {
    name: "playing-hero-paused",
    width: 800,
    height: 240,
    fixture: "playingPaused",
  },
  { name: "playing-hero-empty", width: 390, height: 240, fixture: "playingEmpty" },
  { name: "playing-hero-unavailable", width: 390, height: 240, fixture: "unavailable" },
  {
    name: "playing-hero-episode",
    width: 800,
    height: 240,
    fixture: "playingEpisode",
    evidence: true,
  },
  {
    name: "playing-hero-long-title",
    width: 800,
    height: 240,
    fixture: "playingLong",
    evidence: true,
  },
  {
    name: "playing-hero-no-genres",
    width: 800,
    height: 240,
    fixture: "playingNoGenres",
    evidence: true,
  },
  {
    name: "playing-hero-no-rating",
    width: 800,
    height: 240,
    fixture: "playingNoRating",
    evidence: true,
  },
  {
    name: "playing-hero-no-technical",
    width: 800,
    height: 240,
    fixture: "playingNoTechnical",
    evidence: true,
  },
  {
    name: "playing-hero-minimal",
    width: 800,
    height: 240,
    fixture: "playingMinimal",
    evidence: true,
  },
  { name: "playing-hero-no-image", width: 390, height: 240, fixture: "playingMissing" },
  { name: "playing-hero-multiple", width: 800, height: 240, fixture: "playingMultiple" },
  { name: "playing-hero-many", width: 800, height: 240, fixture: "playingMany" },
  { name: "playing-hero-device-fallback", width: 390, height: 240, fixture: "playingFallback" },
  {
    name: "playing-hero-stale",
    width: 800,
    height: 240,
    fixture: "playingStale",
  },
  { name: "playing-hero-partial", width: 390, height: 240, fixture: "playingPartial" },
  { name: "playing-hero-zero-duration", width: 390, height: 240, fixture: "playingZero" },
  { name: "playing-hero-empty-800", width: 800, height: 240, fixture: "playingEmpty" },
];

function requiredCase(name: string): HeroCase {
  const value = cases.find((candidate) => candidate.name === name);
  if (!value) throw new Error(`Required Playing Hero case is missing: ${name}`);
  return value;
}

const compactPlaying = requiredCase("playing-hero-metadata-390x240");
const intermediatePlaying = requiredCase("playing-hero-metadata-600x240");
const widePlaying = requiredCase("playing-hero-metadata-800x240");
const mobilePlaying = requiredCase("playing-hero-mobile-390x844");
const pausedPlaying = requiredCase("playing-hero-paused");
const emptyPlaying = requiredCase("playing-hero-empty");
const multiplePlaying = requiredCase("playing-hero-multiple");
const manyPlaying = requiredCase("playing-hero-many");
const genericDeviceFallback = requiredCase("playing-hero-device-fallback");
const stalePlaying = requiredCase("playing-hero-stale");

async function openHero(page: Page, value: HeroCase, extras: Record<string, string> = {}) {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/api/octopus_media/image/**", async (route) => {
    await route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><defs><linearGradient id="g"><stop stop-color="#073843"/><stop offset="1" stop-color="#4f246e"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)"/><circle cx="300" cy="390" r="145" fill="#42d8d2" opacity=".72"/><path d="M120 780 300 505 480 780Z" fill="#a774ef" opacity=".86"/></svg>',
      contentType: "image/svg+xml",
      status: 200,
    });
  });
  await page.setViewportSize({
    width: Math.max(320, value.width),
    height: value.viewportHeight ?? Math.max(320, value.height + 40),
  });
  const query = new URLSearchParams({
    width: String(value.width),
    height: String(value.height),
    mode: "playing",
    layout: "hero",
    fixture: value.fixture,
    ...extras,
  });
  await page.goto(`/playwright/harness.html?${query.toString()}`);
  await expect(page.locator("octopus-playing-hero").first()).toBeVisible();
  return requests;
}

for (const value of cases) {
  test(`${value.name} playing hero visual checkpoint`, async ({ page }) => {
    const requests = await openHero(page, value);
    const card = page.locator("octopus-media-card");
    await expect(card.locator('.card[data-playing-hero="true"]')).toBeVisible();
    await expect(card.locator(".card > header")).toHaveCount(0);
    await expect(card.locator("octopus-media-strip")).toHaveCount(0);
    const bounds = await card.locator(".card").evaluate((element) => ({
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      contentHeight:
        element.querySelector<HTMLElement>(":scope > .content")?.getBoundingClientRect().height ??
        0,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    }));
    expect(bounds.clientHeight).toBe(value.height);
    expect(bounds.contentHeight).toBe(value.height);
    expect(bounds.scrollHeight).toBeLessThanOrEqual(bounds.clientHeight);
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth);
    expect(requests.some((url) => /jellyfin|api.?key|authorization/i.test(url))).toBe(false);

    const progress = card.locator("[role=progressbar]");
    if (value.fixture === "playingZero") await expect(progress).toHaveCount(0);
    if (value.fixture === "playingPaused")
      await expect(card.locator(".session.paused")).toBeVisible();
    if (value.fixture === "playingEmpty")
      await expect(card.locator(".playing-state.empty")).toBeVisible();
    if (value.fixture === "unavailable")
      await expect(card.locator(".playing-state.unavailable")).toBeVisible();

    const evidenceRoot = process.env.OCTOPUS_PRIVATE_SCREENSHOTS;
    if (evidenceRoot && value.evidence) {
      await card.screenshot({ path: path.join(evidenceRoot, `${value.name}.png`) });
    }
  });
}

test("playing hero uses distinct compact and wide editorial compositions", async ({ page }) => {
  await openHero(page, compactPlaying);
  const compact = await page.locator("octopus-playing-hero").evaluate((hero) => {
    const content = hero.shadowRoot?.querySelector<HTMLElement>(".session-content");
    const poster = hero.shadowRoot?.querySelector<HTMLElement>(".poster-shell");
    const title = hero.shadowRoot?.querySelector<HTMLElement>("h3");
    if (!content || !poster || !title) throw new Error("Compact hero geometry is incomplete");
    return {
      contentWidth: content.getBoundingClientRect().width,
      posterWidth: poster.getBoundingClientRect().width,
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
    };
  });
  expect(compact.posterWidth / compact.contentWidth).toBeGreaterThanOrEqual(0.3);
  expect(compact.posterWidth / compact.contentWidth).toBeLessThanOrEqual(0.32);
  expect(compact.titleSize).toBeGreaterThanOrEqual(14);

  await openHero(page, widePlaying);
  const wide = await page.locator("octopus-playing-hero").evaluate((hero) => {
    const session = hero.shadowRoot?.querySelector<HTMLElement>(".session");
    const copy = hero.shadowRoot?.querySelector<HTMLElement>(".copy");
    const progress = hero.shadowRoot?.querySelector<HTMLElement>(".progress-track");
    const meta = hero.shadowRoot?.querySelector<HTMLElement>(".session-meta");
    const poster = hero.shadowRoot?.querySelector<HTMLElement>(".poster-shell");
    const times = hero.shadowRoot?.querySelector<HTMLElement>(".times");
    const backdrop = hero.shadowRoot?.querySelector<HTMLElement>(".backdrop");
    const title = hero.shadowRoot?.querySelector<HTMLElement>("h3");
    if (!session || !copy || !progress || !meta || !poster || !times || !backdrop || !title) {
      throw new Error("Wide hero geometry is incomplete");
    }
    const sessionBox = session.getBoundingClientRect();
    const copyBox = copy.getBoundingClientRect();
    const progressBox = progress.getBoundingClientRect();
    return {
      backdropOpacity: Number.parseFloat(getComputedStyle(backdrop).opacity),
      copyRatio: copyBox.width / sessionBox.width,
      copyRightRatio: (copyBox.right - sessionBox.left) / sessionBox.width,
      metaSize: Number.parseFloat(getComputedStyle(meta).fontSize),
      posterWidth: poster.getBoundingClientRect().width,
      progressRatio: progressBox.width / sessionBox.width,
      progressRightRatio: (progressBox.right - sessionBox.left) / sessionBox.width,
      timeSize: Number.parseFloat(getComputedStyle(times).fontSize),
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
    };
  });
  expect(wide.copyRatio).toBeGreaterThan(0.68);
  expect(wide.copyRightRatio).toBeGreaterThan(0.92);
  expect(wide.progressRatio).toBeGreaterThan(0.65);
  expect(wide.progressRightRatio).toBeGreaterThan(0.92);
  expect(wide.posterWidth).toBeLessThanOrEqual(142);
  expect(wide.titleSize).toBeGreaterThanOrEqual(18);
  expect(wide.metaSize).toBeGreaterThanOrEqual(10);
  expect(wide.timeSize).toBeGreaterThanOrEqual(9);
  expect(wide.backdropOpacity).toBeGreaterThanOrEqual(0.8);
});

test("playing hero reveals metadata progressively from the component width", async ({ page }) => {
  await openHero(page, compactPlaying);
  await expect(page.locator(".enriched-metadata")).toBeHidden();
  await expect(page.locator(".editorial-meta.movie")).toBeVisible();
  await expect(page.locator(".technical-chips")).toBeHidden();

  await openHero(page, intermediatePlaying);
  await expect(page.locator(".enriched-metadata")).toBeVisible();
  await expect(page.locator(".editorial-line")).toBeVisible();
  await expect(page.locator(".editorial-meta.movie")).toBeHidden();
  await expect(page.locator(".technical-chips")).toBeHidden();
  await expect(page.locator(".editorial-line span")).toHaveCount(5);
  await expect(page.locator(".editorial-line span").nth(0)).toBeVisible();
  await expect(page.locator(".editorial-line span").nth(1)).toBeVisible();
  await expect(page.locator(".editorial-line span").nth(2)).toBeVisible();
  await expect(page.locator(".editorial-line span").nth(3)).toBeHidden();
  await expect(page.locator(".editorial-line span").nth(4)).toBeHidden();

  await openHero(page, widePlaying);
  await expect(page.locator(".enriched-metadata")).toBeVisible();
  await expect(page.locator(".overview")).toHaveCount(0);
  await expect(page.locator(".editorial-line")).toContainText("2030");
  await expect(page.locator(".editorial-line")).toContainText("1h30");
  await expect(page.locator(".editorial-line")).toContainText("Adventure");
  await expect(page.locator(".editorial-line")).toContainText("Science fiction");
  await expect(page.locator(".editorial-line")).not.toContainText("Mystery");
  await expect(page.locator(".editorial-line span")).toHaveCount(5);
  for (const part of await page.locator(".editorial-line span").all()) {
    await expect(part).toBeVisible();
  }
  await expect(page.locator(".technical-chips span")).toHaveCount(3);
  await expect(page.locator(".technical-chips")).toContainText("1080p");
  await expect(page.locator(".technical-chips")).toContainText("HDR");
  await expect(page.locator(".technical-chips")).toContainText("5.1");

  const flow = await page.locator("octopus-playing-hero").evaluate((hero) => {
    const root = hero.shadowRoot;
    const copy = root?.querySelector<HTMLElement>(".copy");
    const title = root?.querySelector<HTMLElement>(".title-block");
    const editorial = root?.querySelector<HTMLElement>(".editorial-line");
    const technical = root?.querySelector<HTMLElement>(".technical-chips");
    const context = root?.querySelector<HTMLElement>(".session-context");
    const progress = root?.querySelector<HTMLElement>(".progress-block");
    if (!copy || !title || !editorial || !technical || !context || !progress) {
      throw new Error("The wide Playing Hero flow is incomplete");
    }
    const box = (element: HTMLElement) => element.getBoundingClientRect();
    return {
      columns: getComputedStyle(copy).gridTemplateColumns.split(" ").length,
      editorial: {
        bottom: box(editorial).bottom,
        left: box(editorial).left,
        top: box(editorial).top,
      },
      technical: {
        bottom: box(technical).bottom,
        left: box(technical).left,
        top: box(technical).top,
      },
      title: { bottom: box(title).bottom, left: box(title).left },
      context: { left: box(context).left, top: box(context).top },
      progress: { left: box(progress).left, top: box(progress).top },
    };
  });
  expect(flow.columns).toBe(1);
  for (const left of [
    flow.editorial.left,
    flow.technical.left,
    flow.context.left,
    flow.progress.left,
  ]) {
    expect(Math.abs(left - flow.title.left)).toBeLessThanOrEqual(1);
  }
  expect(flow.title.bottom).toBeLessThanOrEqual(flow.editorial.top);
  expect(flow.editorial.bottom).toBeLessThanOrEqual(flow.technical.top);
  expect(flow.technical.bottom).toBeLessThan(flow.context.top);
  expect(flow.context.top).toBeLessThan(flow.progress.top);
});

test("playing hero omits unavailable metadata without visual placeholders", async ({ page }) => {
  for (const fixture of [
    "playingNoGenres",
    "playingNoRating",
    "playingNoTechnical",
    "playingMinimal",
  ]) {
    await openHero(page, { name: fixture, width: 800, height: 240, fixture });
    const text = await page.locator("octopus-playing-hero").innerText();
    expect(text).not.toMatch(/unknown|unavailable|n\/a|sem dados/i);
  }

  await openHero(page, {
    name: "playingMinimal",
    width: 800,
    height: 240,
    fixture: "playingMinimal",
  });
  await expect(page.locator(".overview")).toHaveCount(0);
});

test("playing hero integrates a plain eyebrow and keeps information regions intact", async ({
  page,
}) => {
  for (const value of [compactPlaying, widePlaying]) {
    await openHero(page, value);
    const geometry = await page.locator("octopus-playing-hero").evaluate((hero) => {
      const root = hero.shadowRoot;
      const eyebrow = root?.querySelector<HTMLElement>(".playback-eyebrow");
      const top = root?.querySelector<HTMLElement>(".copy-topline");
      const title = root?.querySelector<HTMLElement>(".title-block");
      const context = root?.querySelector<HTMLElement>(".session-context");
      const progress = root?.querySelector<HTMLElement>(".progress-block");
      const track = root?.querySelector<HTMLElement>(".progress-track");
      const times = root?.querySelector<HTMLElement>(".times");
      const icons = [...(root?.querySelectorAll<HTMLElement>(".session-meta ha-icon") ?? [])];
      const chips = [...(root?.querySelectorAll<HTMLElement>(".session-meta > span") ?? [])];
      if (!eyebrow || !top || !title || !context || !progress || !track || !times) {
        throw new Error("Playing hero region geometry is incomplete");
      }
      const box = (element: HTMLElement) => {
        const bounds = element.getBoundingClientRect();
        return {
          bottom: bounds.bottom,
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
        };
      };
      return {
        chips: chips.map((chip) => ({
          box: box(chip),
          fontSize: Number.parseFloat(getComputedStyle(chip).fontSize),
        })),
        context: box(context),
        eyebrow: {
          background: getComputedStyle(eyebrow).backgroundColor,
          border: getComputedStyle(eyebrow).borderStyle,
          box: box(eyebrow),
          cursor: getComputedStyle(eyebrow).cursor,
          insideSession: Boolean(eyebrow.closest(".session")),
          role: eyebrow.getAttribute("role"),
          text: eyebrow.textContent.trim(),
        },
        icons: icons.map(box),
        progress: box(progress),
        times: box(times),
        top: box(top),
        title: box(title),
        track: box(track),
      };
    });

    expect(geometry.eyebrow.text).toBe("Now playing");
    expect(geometry.eyebrow.background).toBe("rgba(0, 0, 0, 0)");
    expect(geometry.eyebrow.border).toBe("none");
    expect(geometry.eyebrow.cursor).not.toBe("pointer");
    expect(geometry.eyebrow.insideSession).toBe(true);
    expect(geometry.eyebrow.role).toBeNull();
    expect(Math.abs(geometry.eyebrow.box.left - geometry.top.left)).toBeLessThanOrEqual(1);
    expect(geometry.eyebrow.box.bottom).toBeLessThanOrEqual(geometry.top.top);
    expect(geometry.top.bottom).toBeLessThanOrEqual(geometry.title.top);
    expect(geometry.title.bottom).toBeLessThan(geometry.context.top);
    expect(geometry.context.bottom).toBeLessThan(geometry.progress.top);
    expect(geometry.progress.top - geometry.context.bottom).toBeGreaterThanOrEqual(7);
    expect(geometry.times.top - geometry.track.bottom).toBeGreaterThanOrEqual(4);
    expect(geometry.chips).toHaveLength(2);
    expect(geometry.icons).toHaveLength(2);
    geometry.chips.forEach(({ box, fontSize }, index) => {
      const icon = geometry.icons[index];
      if (!icon) throw new Error(`Context icon ${String(index)} is missing`);
      expect(fontSize).toBeGreaterThanOrEqual(9.5);
      expect(icon.width).toBeGreaterThanOrEqual(12);
      expect(icon.height).toBeGreaterThanOrEqual(12);
      expect(icon.left).toBeGreaterThanOrEqual(box.left);
      expect(icon.right).toBeLessThanOrEqual(box.right);
      expect(icon.top).toBeGreaterThanOrEqual(box.top);
      expect(icon.bottom).toBeLessThanOrEqual(box.bottom);
    });
  }
});

test("playing hero uses the shared borderless surface for normal, hover and focus states", async ({
  browser,
  page,
}) => {
  await openHero(page, compactPlaying);
  const session = page.locator(".session");
  const hero = page.locator(".playing-hero");
  const frame = async () =>
    hero.evaluate((element) => {
      const activeSession = element.querySelector<HTMLElement>(".session");
      const track = element.querySelector<HTMLElement>(".session-track");
      if (!activeSession) throw new Error("Playing session is missing");
      if (!track) throw new Error("Playing track is missing");
      const heroStyle = getComputedStyle(element);
      const sessionStyle = getComputedStyle(activeSession);
      const trackStyle = getComputedStyle(track);
      return {
        backgroundClip: heroStyle.backgroundClip,
        backgroundColor: heroStyle.backgroundColor,
        borderColor: heroStyle.borderColor,
        borderRadius: heroStyle.borderRadius,
        borderStyle: heroStyle.borderStyle,
        borderWidth: heroStyle.borderWidth,
        frameLayerCount: element.querySelectorAll(".hero-frame, .hero-frame-line").length,
        focusVisible: activeSession.matches(":focus-visible"),
        padding: heroStyle.padding,
        pseudoContent: getComputedStyle(activeSession, "::after").content,
        sessionRadius: sessionStyle.borderRadius,
        sessionBorderWidth: sessionStyle.borderWidth,
        sessionOutlineStyle: sessionStyle.outlineStyle,
        shadow: heroStyle.boxShadow,
        filter: heroStyle.filter,
        trackRadius: trackStyle.borderRadius,
      };
    });

  const normal = await frame();
  const outer = page.locator('.card[data-playing-hero="true"]');
  const outerGeometry = await outer.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      borderRadius: style.borderRadius,
      borderWidth: style.borderWidth,
      overflow: style.overflow,
    };
  });
  expect(outerGeometry.borderRadius).toBe("0px");
  expect(outerGeometry.borderWidth).toBe("0px");
  expect(outerGeometry.overflow).toBe("visible");
  expect(normal.backgroundClip).toBe("padding-box, padding-box, padding-box");
  expect(normal.borderWidth).toBe("0px");
  expect(normal.borderStyle).toBe("none");
  expect(normal.borderRadius).toBe("13px");
  expect(normal.frameLayerCount).toBe(0);
  expect(normal.padding).toBe("0px");
  expect(normal.sessionBorderWidth).toBe("0px");
  expect(normal.sessionRadius).toBe("0px");
  expect(normal.sessionOutlineStyle).toBe("none");
  expect(normal.pseudoContent).toBe("none");
  expect(normal.shadow).toBe("none");
  expect(normal.trackRadius).toBe("0px");

  await session.hover();
  await page.waitForTimeout(200);
  const hovered = await frame();
  expect(hovered.borderWidth).toBe("0px");
  expect(hovered.borderRadius).toBe(normal.borderRadius);
  expect(hovered.pseudoContent).toBe("none");
  expect(hovered.shadow).toBe("none");
  expect(hovered.filter).toBe("brightness(1.018)");

  await page.mouse.move(0, 300);
  await page.keyboard.press("Tab");
  await expect(session).toBeFocused();
  expect((await frame()).focusVisible).toBe(true);
  await page.waitForTimeout(200);
  const focused = await frame();
  expect(focused.borderWidth).toBe("0px");
  expect(focused.shadow).toBe("none");
  expect(focused.filter).toBe("brightness(1.018)");

  const touchContext = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    hasTouch: true,
    viewport: { height: 844, width: 390 },
  });
  const touchPage = await touchContext.newPage();
  await openHero(touchPage, compactPlaying);
  const touchSession = touchPage.locator(".session");
  const touchHero = touchPage.locator(".playing-hero");
  const touchBorderBefore = await touchHero.evaluate(
    (element) => getComputedStyle(element).borderColor,
  );
  const touchBox = await touchSession.boundingBox();
  if (!touchBox) throw new Error("Touch session geometry is missing");
  await touchPage.touchscreen.tap(
    touchBox.x + touchBox.width / 2,
    touchBox.y + touchBox.height / 2,
  );
  const touchFrame = await touchSession.evaluate((element) => {
    const heroElement = element.closest<HTMLElement>(".playing-hero");
    if (!heroElement) throw new Error("Touch hero is missing");
    return {
      border: getComputedStyle(heroElement).borderColor,
      focusVisible: element.matches(":focus-visible"),
      pseudoContent: getComputedStyle(element, "::after").content,
    };
  });
  expect(touchFrame.focusVisible).toBe(false);
  expect(touchFrame.border).toBe(touchBorderBefore);
  expect(touchFrame.pseudoContent).toBe("none");
  await touchContext.close();
});

test("playing hero captures clean normal and hover borders", async ({ browser }) => {
  const evidenceRoot = process.env.OCTOPUS_BORDER_SCREENSHOTS;
  if (!evidenceRoot) {
    test.skip();
    return;
  }

  for (const deviceScaleFactor of [1, 1.25]) {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:4173",
      deviceScaleFactor,
    });
    const page = await context.newPage();
    const densityRoot = path.join(
      evidenceRoot,
      `dpr-${String(deviceScaleFactor).replace(".", "_")}`,
    );

    const capture = async (name: string, side?: "left" | "right") => {
      const card = page.locator("octopus-media-card");
      if (!side) {
        await card.screenshot({ path: path.join(densityRoot, `${name}.png`) });
        return;
      }
      const bounds = await card.boundingBox();
      if (!bounds) throw new Error("Border evidence geometry is missing");
      await page.screenshot({
        clip: {
          height: 28,
          width: 112,
          x: side === "left" ? bounds.x : bounds.x + bounds.width - 112,
          y: bounds.y,
        },
        path: path.join(densityRoot, `${name}-${side}.png`),
      });
    };

    await openHero(page, compactPlaying);
    await capture("hero-390-normal");
    await capture("hero-390-normal-corner", "left");
    await capture("hero-390-normal-corner", "right");
    await page.locator(".session").hover();
    await page.waitForTimeout(200);
    await capture("hero-390-hover");
    await capture("hero-390-hover-corner", "left");
    await capture("hero-390-hover-corner", "right");

    await openHero(page, widePlaying);
    await capture("hero-800-normal");
    await capture("hero-800-normal-corner", "left");
    await capture("hero-800-normal-corner", "right");
    await page.locator(".session").hover();
    await page.waitForTimeout(200);
    await capture("hero-800-hover");
    await capture("hero-800-hover-corner", "left");
    await capture("hero-800-hover-corner", "right");
    await context.close();
  }
});

test("playing hero exposes session context, time details and editorial metadata", async ({
  page,
}) => {
  await openHero(page, widePlaying);
  await expect(page.locator(".session-meta")).toContainText("Fixture Room");
  await expect(page.locator(".session-meta")).toContainText("Demo Viewer");
  await expect(page.locator(".position")).toHaveText("12:00");
  await expect(page.locator(".duration")).toHaveText("1:30:00");
  await expect(page.locator(".percentage")).toHaveText("13% watched");
  await expect(page.locator(".remaining")).toHaveText("Remaining 1:18:00");
  await expect(page.locator(".session-meta")).toContainText("Fixture Room");

  await openHero(page, genericDeviceFallback);
  await expect(page.locator(".session-meta")).toContainText("Dispositivo Jellyfin");

  const wideEpisode = cases.find((value) => value.name === "playing-hero-episode");
  if (!wideEpisode) throw new Error("Wide episode case is missing");
  await openHero(page, wideEpisode);
  await expect(page.locator(".media-kind")).toHaveText("Episode");
  await expect(page.locator(".editorial-meta.episode")).toContainText("T02E04");
  await expect(page.locator(".editorial-meta.episode")).toContainText("A Map of Quiet Water");
});

test("playing hero keeps empty and stale states honest", async ({ page }) => {
  await openHero(page, emptyPlaying);
  await expect(page.locator(".playing-state.empty")).toBeVisible();
  await expect(page.locator("octopus-playing-hero octopus-media-image")).toHaveCount(0);
  await expect(page.locator("[role=progressbar]")).toHaveCount(0);
  await expect(page.locator(".session")).toHaveCount(0);

  await openHero(page, stalePlaying);
  await expect(page.locator(".session.stale")).toBeVisible();
  await expect(page.locator(".data-flags")).toContainText("Last known data");
  const transition = await page
    .locator(".progress-track > span")
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition).toBe("0s");
});

test("playing hero progress advances, paused freezes, and keyboard changes session", async ({
  page,
}) => {
  await openHero(page, compactPlaying);
  const playingFill = page.locator(".progress-track > span");
  const before = Number.parseFloat((await playingFill.getAttribute("style"))?.slice(6) ?? "0");
  await expect
    .poll(async () => Number.parseFloat((await playingFill.getAttribute("style"))?.slice(6) ?? "0"))
    .toBeGreaterThan(before);

  await openHero(page, pausedPlaying);
  const paused = page.locator("[role=progressbar]");
  const frozen = await paused.getAttribute("aria-valuenow");
  await page.waitForTimeout(1100);
  expect(await paused.getAttribute("aria-valuenow")).toBe(frozen);

  await openHero(page, multiplePlaying);
  const first = page.locator("[data-session-index='0']");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-session-index='1']")).toHaveAttribute("data-active", "true");
  await expect(page.locator("[data-session-index='1']")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("[data-session-index='0']")).toHaveAttribute("data-active", "true");
  await expect(page.locator("[data-session-index='0']")).toBeFocused();
});

test("playing hero auto route, navigation density and instances stay independent", async ({
  page,
}) => {
  await openHero(page, compactPlaying, { layout: "auto" });
  await expect(page.locator('.card[data-layout="hero"][data-playing-hero="true"]')).toBeVisible();

  await openHero(page, compactPlaying);
  await expect(page.locator(".session-arrows")).toHaveCount(0);
  await expect(page.locator(".session-indicators")).toHaveCount(0);

  await openHero(page, manyPlaying);
  await expect(page.locator(".session")).toHaveCount(5);
  await expect(page.locator(".session-arrows")).toBeVisible();
  await expect(page.locator(".session-indicators button")).toHaveCount(5);
  await page.locator(".session-indicators button").nth(2).click();
  await expect(page.locator("[data-session-index='2']")).toContainText(
    "A Deliberately Long Fictional Friendly Device Alias",
  );

  await openHero(page, multiplePlaying, { instances: "2" });
  const heroes = page.locator("octopus-playing-hero");
  await expect(heroes).toHaveCount(2);
  const firstHero = heroes.nth(0);
  const secondHero = heroes.nth(1);
  await firstHero.locator("[data-session-index='0']").focus();
  await page.keyboard.press("ArrowRight");
  await expect(firstHero.locator("[data-session-index='1']")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(secondHero.locator("[data-session-index='0']")).toHaveAttribute(
    "data-active",
    "true",
  );
});

test("playing hero survives 125 percent zoom and device scale 1.25", async ({ browser, page }) => {
  await openHero(page, compactPlaying);
  await page.evaluate(() => {
    document.body.style.zoom = "1.25";
  });
  const zoom = await page.locator(".card").evaluate((element) => ({
    client: element.clientHeight,
    scroll: element.scrollHeight,
  }));
  expect(zoom.scroll).toBeLessThanOrEqual(zoom.client);

  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    deviceScaleFactor: 1.25,
    viewport: { width: 390, height: 844 },
  });
  const scaled = await context.newPage();
  await openHero(scaled, mobilePlaying);
  await expect(scaled.locator("octopus-playing-hero")).toBeVisible();
  await context.close();
});
