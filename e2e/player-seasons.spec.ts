import { test, expect } from "@playwright/test";

/**
 * A player's stretch picker — "All time" and every season they played in —
 * must keep every season readable and reachable.
 *
 * It scrolls sideways on a phone on purpose, so the test is not that it fits
 * but that nothing in it is crushed or cut off, and that the season furthest
 * along can still be reached and picked. It went unseen once before because
 * the seed only ever made two seasons, so it insists on enough to matter.
 */

const stretches = (page: import("@playwright/test").Page) =>
  page.getByRole("group", { name: "Over which stretch" });

test.beforeEach(async ({ page }) => {
  await page.goto("/players");
  await page.waitForLoadState("networkidle");
  await page
    .locator('a[href^="/players/"]:not([href*="/edit/"]):not([href$="/add"])')
    .first()
    .click();
  await expect(page).toHaveURL(/\/players\/[0-9a-f-]{36}/);
  await page.waitForLoadState("networkidle");
});

test("offers all time and every season they played in", async ({ page }) => {
  const group = stretches(page);
  await expect(group).toBeVisible();
  await expect(group.getByRole("button", { name: "All time" })).toBeVisible();
  // If the seed stops producing enough seasons this should fail loudly
  // rather than quietly stop testing.
  expect(await group.getByRole("button").count()).toBeGreaterThanOrEqual(5);
});

test("no season's name is squeezed or cut off", async ({ page }) => {
  for (const chip of await stretches(page).getByRole("button").all()) {
    const box = await chip.boundingBox();
    expect(box!.width).toBeGreaterThan(48);
    // Content wider than the chip means the name is clipped.
    expect(await chip.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("the last season can be reached and picked", async ({ page }) => {
  const last = stretches(page).getByRole("button").last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  await last.click();
  await expect(last).toHaveAttribute("aria-pressed", "true");
});
