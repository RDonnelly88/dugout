import { test, expect } from "@playwright/test";

/** Fixed by the migration that seeds it, so it can be selected directly. */
const DEMO_TEAM = "0d000000-0000-4000-8000-000000000001";

/**
 * The demo team is readable by anyone signed in and writable by nobody.
 *
 * The guarantee is in the database — it has no owner and no members, so every
 * policy that permits a write evaluates false. These check the app agrees:
 * that the data actually arrives, that it is announced as a demo rather than
 * looking like your own squad, and that nothing offers to change it.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript((id) => {
    window.localStorage.setItem("currentTeamId", id);
  }, DEMO_TEAM);
});

test("shows the demo squad and says that is what it is", async ({ page }) => {
  await page.goto("/players");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText(/looking at the demo team/i)).toBeVisible();

  // The seeded squad, not an empty state.
  await expect(page.getByRole("heading", { name: "Ade" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Baz" })).toBeVisible();
});

test("offers nothing that would change it", async ({ page }) => {
  await page.goto("/players");
  await page.waitForLoadState("networkidle");

  // Adding, editing and deleting are all admin-only, and nobody is an admin of
  // a team with no members.
  await expect(page.getByRole("link", { name: /add player/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^edit /i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^delete /i })).toHaveCount(0);
});

test("keeps the results and the table", async ({ page }) => {
  await page.goto("/matches");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("listitem").first()).toBeVisible();

  await page.goto("/seasons");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Autumn").first()).toBeVisible();
});

test("does not name anybody else in it", async ({ page }) => {
  await page.goto("/team");
  await page.waitForLoadState("networkidle");

  // `team_members` has no demo policy, so the roster is as private as any
  // other team's — the page renders, and lists nobody.
  await expect(page.getByText(/looking at the demo team/i)).toBeVisible();
  await expect(page.getByRole("cell", { name: /@/ })).toHaveCount(0);
});
