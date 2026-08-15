import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";

/**
 * Sign in once and hand the session to every other project.
 *
 * Through the password form rather than a forged cookie, so the proxy actually
 * issues the session the specs then run under. The magic-link and passkey
 * routes have their own coverage; this is the one that has to be quick,
 * because everything depends on it.
 */

const EMAIL = process.env.E2E_EMAIL ?? "demo@example.test";
const PASSWORD = process.env.E2E_PASSWORD ?? "correct-horse-battery-staple";
const STATE = ".auth/user.json";

setup("authenticate", async ({ page, context }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Landing anywhere but /login is the proof the session took.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await expect(page.getByRole("link", { name: /players/i }).first()).toBeVisible();

  fs.mkdirSync(".auth", { recursive: true });
  await context.storageState({ path: STATE });
});
