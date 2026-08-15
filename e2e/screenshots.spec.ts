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

/**
 * Waits for the page to actually have something on it.
 *
 * A fixed pause after `networkidle` is not enough. The suite starts a cold dev
 * server every run, so the first visit to a route compiles it on demand, and a
 * screenshot taken during that is a picture of an empty page — which passes,
 * because nothing here asserts. The player page came out blank that way.
 *
 * Waiting on real content rather than a timeout means the pause can be short
 * when nothing is compiling and long when something is.
 */
async function settled(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page
    .waitForFunction(() => document.body.innerText.trim().length > 150, null, {
      timeout: 30_000,
    })
    .catch(() => {});
  // Charts and list animations land just after the text does.
  await page.waitForTimeout(500);
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

  /*
   * The pages you can only reach by clicking something. These were named
   * "-dark" and never set a theme, so the dark half of three pages was never
   * actually photographed — and the season one asserted nothing, so when the
   * click stopped landing it quietly captured the list instead and passed.
   */
  for (const theme of ["light", "dark"] as const) {
    test(`player detail ${theme}`, async ({ page }, info) => {
      await setTheme(page, theme);
      await page.goto("/players");
      await settled(page);
      // Straight to a player URL rather than hunting for a link by name: the
      // cards carry several, and which one reads as "the player" is exactly
      // the kind of thing this redesign is changing.
      await page
        .locator('a[href^="/players/"]:not([href*="/edit/"]):not([href$="/add"])')
        .first()
        .click();
      // Before settling, not after: `networkidle` resolves while the client is
      // still on the previous route, so the wait was being satisfied by the
      // page we had just left and the shot caught the next one half-built.
      await page.waitForURL(/\/players\/[0-9a-f-]{36}/);
      await settled(page);
      await shot(page, info.project.name, `09-player-detail-${theme}`);
    });

    test(`season detail ${theme}`, async ({ page }, info) => {
      await setTheme(page, theme);
      await page.goto("/seasons");
      await settled(page);
      // Not the "Create Season" action in the nav, which is also a /seasons/
      // link and is hidden inside the drawer on a phone.
      await page
        .locator('a[href^="/seasons/"]:not([href$="/create"])')
        .first()
        .click();
      await page.waitForURL(/\/seasons\/[0-9a-f-]{36}/);
      await settled(page);
      await shot(page, info.project.name, `10-season-detail-${theme}`);
    });

    test(`match detail ${theme}`, async ({ page }, info) => {
      await setTheme(page, theme);
      await page.goto("/matches");
      await settled(page);
      await page.locator('a[href^="/matches/"]:not([href$="/create"])').first().click();
      await page.waitForURL(/\/matches\/[0-9a-f-]{36}/);
      await settled(page);
      await shot(page, info.project.name, `12-match-detail-${theme}`);
    });

    test(`login ${theme}`, async ({ page, context }, info) => {
      await setTheme(page, theme);
      await context.clearCookies();
      await page.goto("/login");
      await settled(page);
      await shot(page, info.project.name, `11-login-${theme}`);
    });
  }
});
