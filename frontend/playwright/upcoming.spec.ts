import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

interface UpcomingCase {
  fixture: string;
  height: number;
  name: string;
  width: number;
}

const cases: UpcomingCase[] = [
  { name: "upcoming-desktop-960x160", width: 960, height: 160, fixture: "upcomingArtwork" },
  { name: "upcoming-wide-800x160", width: 800, height: 160, fixture: "upcomingArtwork" },
  { name: "upcoming-mobile-390x160", width: 390, height: 160, fixture: "upcomingArtwork" },
  { name: "upcoming-mixed-800x160", width: 800, height: 160, fixture: "upcomingDesktop" },
  { name: "upcoming-movie-long-800x160", width: 800, height: 160, fixture: "upcomingDesktop" },
  { name: "upcoming-episode-long-800x160", width: 800, height: 160, fixture: "upcomingDesktop" },
  { name: "upcoming-one-missing-960x160", width: 960, height: 160, fixture: "upcomingOneMissing" },
  { name: "upcoming-empty-800x240", width: 800, height: 240, fixture: "upcomingEmpty" },
  { name: "upcoming-partial-800x240", width: 800, height: 240, fixture: "upcomingPartial" },
  { name: "upcoming-stale-800x240", width: 800, height: 240, fixture: "upcomingStale" },
];

async function openUpcoming(page: Page, item: UpcomingCase): Promise<void> {
  await page.route("**/api/octopus_media/image/**", async (route) => {
    const requestUrl = route.request().url();
    const assetName =
      requestUrl.includes("image_C") || requestUrl.includes("image_F")
        ? "upcoming-poster-b.svg"
        : requestUrl.includes("image_E")
          ? "upcoming-poster-c.svg"
          : "upcoming-poster-a.svg";
    const body = readFileSync(path.join("playwright", "assets", assetName));
    await route.fulfill({
      body,
      contentType: "image/svg+xml",
      status: 200,
    });
  });
  await page.setViewportSize({ width: item.width, height: 320 });
  await page.goto(
    `/playwright/harness.html?width=${String(item.width)}&height=${String(item.height)}&mode=upcoming&layout=strip&fixture=${item.fixture}`,
  );
  await expect(page.locator("octopus-media-card")).toBeVisible();
  if (item.fixture !== "upcomingEmpty") {
    await expect(page.locator('octopus-media-strip[data-layout="upcoming"]')).toBeVisible();
  }
}

for (const item of cases) {
  test(`${item.name} renders the dedicated Upcoming strip`, async ({ page }) => {
    await openUpcoming(page, item);
    const strip = page.locator('octopus-media-strip[data-layout="upcoming"]');
    if (item.fixture === "upcomingEmpty") {
      await expect(page.locator(".upcoming-empty")).toBeVisible();
      await page.locator("octopus-media-card").screenshot({
        path: path.join("screenshots", "upcoming", `${item.name}.png`),
      });
    } else {
      const expectedCount =
        item.fixture === "upcomingPartial"
          ? 2
          : item.fixture === "upcomingArtwork" || item.fixture === "upcomingOneMissing"
            ? 5
            : 6;
      await expect(strip.locator(".poster")).toHaveCount(expectedCount);
      await expect(strip.locator(".poster").first()).toContainText("AMANHÃ");
      await expect(strip.locator(".poster").first()).not.toContainText("radarr");
      await expect(strip.locator(".poster").first()).not.toContainText("sonarr");
      await expect(page.locator("octopus-media-card .context")).toHaveCount(0);
      await page.locator("octopus-media-card").screenshot({
        path: path.join("screenshots", "upcoming", `${item.name}.png`),
      });
    }
  });
}

test("Upcoming arrows remain hidden when the shared geometry fits all cards", async ({ page }) => {
  const desktop = { fixture: "upcomingDesktop", width: 960, height: 160, name: "arrow" };
  await openUpcoming(page, desktop);
  const strip = page.locator('octopus-media-strip[data-layout="upcoming"]');
  await expect(strip.locator(".arrow.previous")).toBeHidden();
  await expect(strip.locator(".arrow.next")).toBeHidden();
});

test("Upcoming hover remains subtle and does not add a border", async ({ page }) => {
  const desktop = { fixture: "upcomingArtwork", width: 800, height: 160, name: "hover" };
  await openUpcoming(page, desktop);
  const strip = page.locator('octopus-media-strip[data-layout="upcoming"]');
  const second = strip.locator(".poster").nth(1);
  await second.hover();
  await expect(second).toHaveCSS("border-width", "0px");
  await page.locator("octopus-media-card").screenshot({
    path: path.join("screenshots", "upcoming", "upcoming-hover-800x160.png"),
  });
});

test("Recentes sibling capture uses the same official strip primitive", async ({ page }) => {
  await page.route("**/api/octopus_media/image/**", async (route) => {
    const body = readFileSync(path.join("playwright", "assets", "upcoming-poster-a.svg"));
    await route.fulfill({ body, contentType: "image/svg+xml", status: 200 });
  });
  await page.setViewportSize({ width: 800, height: 320 });
  await page.goto(
    "/playwright/harness.html?width=800&height=160&mode=recent&layout=strip&fixture=episode",
  );
  await expect(page.locator("octopus-media-strip")).toBeVisible();
  await page.locator("octopus-media-card").screenshot({
    path: path.join("screenshots", "upcoming", "recentes-sibling-800x160.png"),
  });
});
