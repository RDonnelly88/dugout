# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshots.spec.ts >> screenshots >> player detail
- Location: e2e\screenshots.spec.ts:57:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/players\/[0-9a-f-]{36}/
Received string:  "http://localhost:3100/seasons/227426b6-fb68-4f6e-aa58-75070b91305c"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    5 × locator resolved to <html lang="en-GB">…</html>
      - unexpected value "http://localhost:3100/players"
    8 × locator resolved to <html lang="en-GB">…</html>
      - unexpected value "http://localhost:3100/seasons/227426b6-fb68-4f6e-aa58-75070b91305c"

```

```yaml
- complementary:
  - button "Thursday Nighters"
  - button
  - button "Collapse sidebar"
  - link "Home":
    - /url: /
  - link "Players":
    - /url: /players
  - link "Matches":
    - /url: /matches
  - link "Seasons":
    - /url: /seasons
  - link "Team":
    - /url: /team
  - link "Settings":
    - /url: /settings
  - heading "Actions" [level=3]
  - link "Add Player":
    - /url: /players/add
  - link "Create Match":
    - /url: /matches/create
  - link "Create Season":
    - /url: /seasons/create
- main:
  - link "Seasons":
    - /url: /seasons
  - button "Summer 2026"
  - button "Edit"
  - button "Delete"
  - heading "Summer 2026 Current Season" [level=1]
  - text: 23/04/2026 - Ongoing 16 Matches Pikey
  - tablist:
    - tab "League Table" [selected]
    - tab "Position Tracking"
    - tab "Matches"
  - tabpanel "League Table":
    - heading "Summer 2026 League Table" [level=3]
    - paragraph: Player rankings and statistics
    - table:
      - rowgroup:
        - row "Rank Player Form P W D L Pts":
          - columnheader "Rank"
          - columnheader "Player"
          - columnheader "Form"
          - columnheader "P"
          - columnheader "W"
          - columnheader "D"
          - columnheader "L"
          - columnheader "Pts"
      - rowgroup:
        - row "1 Pikey W W W W 12 10 0 2 30":
          - cell "1"
          - cell "Pikey":
            - link "Pikey":
              - /url: /players/1cdce482-c381-420c-9f94-f7043aaf7e8a
          - cell "W W W W"
          - cell "12"
          - cell "10"
          - cell "0"
          - cell "2"
          - cell "30"
        - row "1 Vinny W W W 12 10 0 2 30":
          - cell "1"
          - cell "Vinny":
            - link "Vinny":
              - /url: /players/2bc88a69-cb72-4d4d-b51a-fa24b60c2ed3
          - cell "W W W"
          - cell "12"
          - cell "10"
          - cell "0"
          - cell "2"
          - cell "30"
        - row "3 Macca L L L W L 15 9 0 6 27":
          - cell "3"
          - cell "Macca":
            - link "Macca":
              - /url: /players/5d2961d2-cfa5-48e4-b6d0-69d6faf352f4
          - cell "L L L W L"
          - cell "15"
          - cell "9"
          - cell "0"
          - cell "6"
          - cell "27"
        - row "4 Woody W W L L W 14 9 0 5 27":
          - cell "4"
          - cell "Woody":
            - link "Woody":
              - /url: /players/92542581-3d54-46bb-91af-7c1f0072b350
          - cell "W W L L W"
          - cell "14"
          - cell "9"
          - cell "0"
          - cell "5"
          - cell "27"
        - row "5 Nobby W W W 13 8 0 5 24":
          - cell "5"
          - cell "Nobby":
            - link "Nobby":
              - /url: /players/aec57974-4400-4ec6-9e43-825250253982
          - cell "W W W"
          - cell "13"
          - cell "8"
          - cell "0"
          - cell "5"
          - cell "24"
        - row "6 Ritchie L W L L L 15 6 0 9 18":
          - cell "6"
          - cell "Ritchie":
            - link "Ritchie":
              - /url: /players/29a466ac-de9f-41c5-9d83-81982e01ee46
          - cell "L W L L L"
          - cell "15"
          - cell "6"
          - cell "0"
          - cell "9"
          - cell "18"
        - row "7 Keeper L W L W 14 6 0 8 18":
          - cell "7"
          - cell "Keeper":
            - link "Keeper":
              - /url: /players/43d8e17c-6c36-46fd-a392-07472c801ca6
          - cell "L W L W"
          - cell "14"
          - cell "6"
          - cell "0"
          - cell "8"
          - cell "18"
        - row "8 Scouse W L W L 13 6 0 7 18":
          - cell "8"
          - cell "Scouse":
            - link "Scouse":
              - /url: /players/666a2236-698d-4e71-821f-66cac5416407
          - cell "W L W L"
          - cell "13"
          - cell "6"
          - cell "0"
          - cell "7"
          - cell "18"
        - row "9 Tosh W L W L W 15 5 0 10 15":
          - cell "9"
          - cell "Tosh":
            - link "Tosh":
              - /url: /players/5f14c89b-20ed-4e76-950c-1ca5e26592f6
          - cell "W L W L W"
          - cell "15"
          - cell "5"
          - cell "0"
          - cell "10"
          - cell "15"
        - row "10 Deano L L W L 13 5 0 8 15":
          - cell "10"
          - cell "Deano":
            - link "Deano":
              - /url: /players/67d63674-11be-4c57-a584-4971cd96cbe5
          - cell "L L W L"
          - cell "13"
          - cell "5"
          - cell "0"
          - cell "8"
          - cell "15"
        - row "11 Ollie L L W 12 5 0 7 15":
          - cell "11"
          - cell "Ollie":
            - link "Ollie":
              - /url: /players/6d2936ec-e37d-402b-a36c-cc63e296a49c
          - cell "L L W"
          - cell "12"
          - cell "5"
          - cell "0"
          - cell "7"
          - cell "15"
        - row "12 Baz L W L L L 12 1 0 11 3":
          - cell "12"
          - cell "Baz":
            - link "Baz":
              - /url: /players/e6d569f4-7a57-4229-a9f0-60cba0a8bb5b
          - cell "L W L L L"
          - cell "12"
          - cell "1"
          - cell "0"
          - cell "11"
          - cell "3"
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1  | import { test, expect, type Page } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | 
  4  | /**
  5  |  * The visual record. Not assertions — a folder of screenshots to look at.
  6  |  *
  7  |  * `npm run e2e:shots` writes every page at the running project's viewport, in
  8  |  * both themes. Reviewing a design change means opening these, which is the
  9  |  * only way to catch something that is technically rendering and visually
  10 |  * wrong.
  11 |  */
  12 | 
  13 | const dir = (project: string) => `e2e/screenshots/${project}`;
  14 | 
  15 | async function shot(page: Page, project: string, name: string) {
  16 |   fs.mkdirSync(dir(project), { recursive: true });
  17 |   await page.screenshot({ path: `${dir(project)}/${name}.png`, fullPage: true });
  18 | }
  19 | 
  20 | /** Flip the theme the same way the toggle does, without needing it on screen. */
  21 | async function setTheme(page: Page, theme: "light" | "dark") {
  22 |   await page.emulateMedia({ colorScheme: theme });
  23 |   await page.evaluate((t) => {
  24 |     document.documentElement.setAttribute("data-theme", t);
  25 |   }, theme);
  26 | }
  27 | 
  28 | /** Charts and lists settle a moment after navigation. */
  29 | async function settled(page: Page) {
  30 |   await page.waitForLoadState("networkidle").catch(() => {});
  31 |   await page.waitForTimeout(400);
  32 | }
  33 | 
  34 | const PAGES = [
  35 |   { path: "/", name: "01-home" },
  36 |   { path: "/players", name: "02-players" },
  37 |   { path: "/matches", name: "03-matches" },
  38 |   { path: "/seasons", name: "04-seasons" },
  39 |   { path: "/team", name: "05-team" },
  40 |   { path: "/settings", name: "06-settings" },
  41 |   { path: "/matches/create", name: "07-create-match" },
  42 |   { path: "/seasons/create", name: "08-create-season" },
  43 | ];
  44 | 
  45 | test.describe("screenshots", () => {
  46 |   for (const theme of ["light", "dark"] as const) {
  47 |     for (const { path, name } of PAGES) {
  48 |       test(`${name} ${theme}`, async ({ page }, info) => {
  49 |         await setTheme(page, theme);
  50 |         await page.goto(path);
  51 |         await settled(page);
  52 |         await shot(page, info.project.name, `${name}-${theme}`);
  53 |       });
  54 |     }
  55 |   }
  56 | 
  57 |   test("player detail", async ({ page }, info) => {
  58 |     await page.goto("/players");
  59 |     await settled(page);
  60 |     const first = page.getByRole("link", { name: /view|profile/i }).first();
  61 |     if (await first.count()) {
  62 |       await first.click();
  63 |     } else {
  64 |       // Fall back to the first card link on the page.
  65 |       await page.locator('a[href^="/players/"]').first().click();
  66 |     }
  67 |     await settled(page);
> 68 |     await expect(page).toHaveURL(/\/players\/[0-9a-f-]{36}/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  69 |     await shot(page, info.project.name, "09-player-detail-dark");
  70 |   });
  71 | 
  72 |   test("season detail", async ({ page }, info) => {
  73 |     await page.goto("/seasons");
  74 |     await settled(page);
  75 |     await page.locator('a[href^="/seasons/"]').first().click();
  76 |     await settled(page);
  77 |     await shot(page, info.project.name, "10-season-detail-dark");
  78 |   });
  79 | 
  80 |   test("login", async ({ page, context }, info) => {
  81 |     await context.clearCookies();
  82 |     await page.goto("/login");
  83 |     await settled(page);
  84 |     await shot(page, info.project.name, "11-login-dark");
  85 |   });
  86 | });
  87 | 
```