import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the LOCAL Supabase stack.
 *
 * Prerequisites: `supabase start` and `npm run seed:local`. The specs sign in
 * as the seeded account and write data, so they must never point at the hosted
 * project.
 */

/**
 * Its own port and its own server. Not 3000: reusing whatever dev server
 * happens to be running would point these specs at whichever database that one
 * was started against, and they write data.
 */
const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/** The local stack's fixed demo keys. They are worthless anywhere else. */
const LOCAL_SUPABASE_URL = "http://127.0.0.1:54331";
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export default defineConfig({
  testDir: "./e2e",
  // Serial: the specs share one seeded account, so parallel writes would race.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-GB",
    timezoneId: "Europe/London",
    /**
     * Playwright won't click an element until its bounding box holds still for
     * two frames, and this app has several things that animate indefinitely —
     * the card reveal, the loading sheen. Standing them down removes a whole
     * class of timeout, and stops the visual record catching a chart mid-draw.
     */
    contextOptions: { reducedMotion: "reduce" },
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 14 Pro"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: `next dev --port ${PORT}`,
    url: BASE_URL,
    // Never reuse: see the note on PORT.
    reuseExistingServer: false,
    timeout: 120_000,
    // Next reads .env.local into process.env but doesn't overwrite what's
    // already there, so these win over whatever that file points at.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: LOCAL_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: LOCAL_ANON_KEY,
    },
  },
});
