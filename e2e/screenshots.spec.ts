import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

/**
 * The visual record. Not assertions — a folder of screenshots to look at.
 *
 * `npm run e2e:shots` writes every page at the running project's viewport, in
 * both themes. Reviewing a design change means opening these, which is the
 * only way to catch something that is technically rendering and visually
 * wrong.
 */

const dir = (project: string) => `e2e/screenshots/${project}`;

async function shot(page: Page, project: string, name: string) {
  fs.mkdirSync(dir(project), { recursive: true });
  await page.screenshot({ path: `${dir(project)}/${name}.png`, fullPage: true });
}

/** Flip the theme the same way the toggle does, without needing it on screen. */
async function setTheme(page: Page, theme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
}

/** Charts and lists settle a moment after navigation. */
async function settled(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);
}

const PAGES = [
  { path: "/", name: "01-home" },
  { path: "/players", name: "02-players" },
  { path: "/matches", name: "03-matches" },
  { path: "/seasons", name: "04-seasons" },
  { path: "/ratings", name: "04b-ratings" },
  { path: "/compare", name: "04c-compare" },
  { path: "/team", name: "05-team" },
  { path: "/settings", name: "06-settings" },
  { path: "/matches/create", name: "07-create-match" },
  { path: "/seasons/create", name: "08-create-season" },
];

test.describe("screenshots", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const { path, name } of PAGES) {
      test(`${name} ${theme}`, async ({ page }, info) => {
        await setTheme(page, theme);
        await page.goto(path);
        await settled(page);
        await shot(page, info.project.name, `${name}-${theme}`);
      });
    }
  }

  test("player detail", async ({ page }, info) => {
    await page.goto("/players");
    await settled(page);
    // Straight to a player URL rather than hunting for a link by name: the
    // cards carry several, and which one reads as "the player" is exactly the
    // kind of thing this redesign is changing.
    await page
      .locator('a[href^="/players/"]:not([href*="/edit/"]):not([href$="/add"])')
      .first()
      .click();
    await settled(page);
    await expect(page).toHaveURL(/\/players\/[0-9a-f-]{36}/);
    await shot(page, info.project.name, "09-player-detail-dark");
  });

  test("season detail", async ({ page }, info) => {
    await page.goto("/seasons");
    await settled(page);
    // Not the "Create Season" action in the nav, which is also a /seasons/ link
    // and is hidden inside the drawer on a phone.
    await page
      .locator('a[href^="/seasons/"]:not([href$="/create"])')
      .first()
      .click();
    await settled(page);
    await shot(page, info.project.name, "10-season-detail-dark");
  });

  test("login", async ({ page, context }, info) => {
    await context.clearCookies();
    await page.goto("/login");
    await settled(page);
    await shot(page, info.project.name, "11-login-dark");
  });
});
