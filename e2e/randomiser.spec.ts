import { test, expect, type Locator } from "@playwright/test";

/** The player names listed inside a side of the reveal or the formation. */
async function namesIn(scope: Locator): Promise<string[]> {
  const raw = await scope.allInnerTexts();
  return raw
    .join("\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

/**
 * The teams the randomiser deals must be the teams the match ends up with.
 *
 * They were not. The dialog worked out a balanced split and dealt it card by
 * card, then handed the page a flat list, which reshuffled it and cut it down
 * the middle — so picking "even by rating" changed nothing, and the sides shown
 * during the reveal were not the sides recorded.
 */
test("the teams dealt are the teams kept", async ({ page }) => {
  await page.goto("/matches/create");

  // Balanced rather than shuffled: the result is then deterministic, so a
  // reshuffle downstream almost certainly disagrees with it.
  await page.getByRole("button", { name: /even by rating/i }).click();
  await page.getByRole("button", { name: /pick the teams/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /skip to the end/i }).click();

  // The name only. Reading the whole row picks up the avatar's initial, which
  // is a single letter and matches almost anything.
  const dealtBibs = await namesIn(
    dialog.locator("ul").first().getByTestId("dealt-name")
  );
  const dealtSkins = await namesIn(
    dialog.locator("ul").nth(1).getByTestId("dealt-name")
  );

  expect(dealtBibs.length).toBeGreaterThan(0);
  expect(dealtSkins.length).toBeGreaterThan(0);

  await dialog.getByRole("button", { name: /use these teams/i }).click();
  await expect(dialog).toBeHidden();

  const assignedA = page.getByTestId("formation-team-a");
  await expect(assignedA).toContainText(dealtBibs[0]);

  // Every name dealt to one side has to be on that side, and none of the other
  // side's names may appear there. Sizes alone would not catch a reshuffle:
  // twelve players split six and six either way.
  for (const name of dealtBibs) {
    await expect(assignedA).toContainText(name);
  }
  for (const name of dealtSkins) {
    await expect(assignedA).not.toContainText(name);
  }
});
