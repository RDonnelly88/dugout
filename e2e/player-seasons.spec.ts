import { test, expect, type Locator } from "@playwright/test";

/**
 * A player's season tabs must stay inside the bar that holds them.
 *
 * `TabsList` is a fixed-height row and the triggers used to split its width
 * between them, so a squad with several seasons behind it had six tabs crammed
 * into a bar built for two and spilling out of its own rounded edge. It went
 * unseen because the seed only ever made two seasons.
 */

/** Every tab in the list, and the box the list itself occupies. */
async function boxes(list: Locator) {
  const listBox = await list.boundingBox();
  const tabs = await list.getByRole("tab").all();
  const tabBoxes = await Promise.all(tabs.map((tab) => tab.boundingBox()));
  return { listBox, tabBoxes };
}

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

test("the season tabs stay inside their bar", async ({ page }) => {
  // The list holding "All time", not the All stats / Chemistry one above it.
  const list = page
    .getByRole("tablist")
    .filter({ has: page.getByRole("tab", { name: "All time" }) });
  await expect(list).toBeVisible();

  // Enough seasons that they cannot all fit across one row, or the test would
  // pass without exercising anything. If the seed stops producing them this
  // should fail loudly rather than quietly stop testing.
  const tabs = list.getByRole("tab");
  expect(await tabs.count()).toBeGreaterThanOrEqual(5);

  const { listBox, tabBoxes } = await boxes(list);
  expect(listBox).not.toBeNull();

  for (const box of tabBoxes) {
    expect(box).not.toBeNull();
    // Half a pixel of slack for sub-pixel layout, and no more.
    expect(box!.x).toBeGreaterThanOrEqual(listBox!.x - 0.5);
    expect(box!.y).toBeGreaterThanOrEqual(listBox!.y - 0.5);
    expect(box!.x + box!.width).toBeLessThanOrEqual(
      listBox!.x + listBox!.width + 0.5
    );
    expect(box!.y + box!.height).toBeLessThanOrEqual(
      listBox!.y + listBox!.height + 0.5
    );
  }
});

test("no season tab is squeezed too narrow to read", async ({ page }) => {
  const list = page
    .getByRole("tablist")
    .filter({ has: page.getByRole("tab", { name: "All time" }) });

  // Sharing one row between six of them does not always overflow — on a wide
  // screen it just crushes each one instead, which is the same bug wearing a
  // different coat. A season name needs more than this to be legible.
  const { tabBoxes } = await boxes(list);
  for (const box of tabBoxes) {
    expect(box!.width).toBeGreaterThan(48);
  }
});

test("the season tabs do not scroll sideways", async ({ page }) => {
  const list = page
    .getByRole("tablist")
    .filter({ has: page.getByRole("tab", { name: "All time" }) });

  // Content wider than the box means it is cut off or scrolling, either of
  // which hides a season behind an edge.
  const overflow = await list.evaluate(
    (el) => el.scrollWidth - el.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("every season tab can be read and selected", async ({ page }) => {
  const list = page
    .getByRole("tablist")
    .filter({ has: page.getByRole("tab", { name: "All time" }) });

  // The last one is the tab furthest from the start, so it is the one a row
  // that overflowed would have pushed out of reach.
  const last = list.getByRole("tab").last();
  await expect(last).toBeVisible();

  const label = (await last.textContent())?.trim() ?? "";
  expect(label.length).toBeGreaterThan(0);

  await last.click();
  await expect(last).toHaveAttribute("aria-selected", "true");
});
