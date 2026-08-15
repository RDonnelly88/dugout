# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-team.spec.ts >> shows the demo squad and says that is what it is
- Location: e2e\demo-team.spec.ts:20:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/looking at the demo team/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/looking at the demo team/i)

```

```yaml
- main:
  - button "Open navigation"
  - text: Thursday Nighters
  - heading "Players" [level=1]
  - paragraph: The squad, their records and their form
  - heading "Summer 2026" [level=3]
  - paragraph: Current season · 23/04/2026 – ongoing
  - text: 10 have featured
  - link "View the league table":
    - /url: /seasons/25c7ade6-ca02-45e6-8d88-b63d83e54b88
  - textbox "Search players..."
  - group "Which players to show":
    - text: Which players to show
    - button "Active 10" [pressed]
    - button "Everyone 12"
  - link "Add player":
    - /url: /players/add
  - link "Edit Baz":
    - /url: /players/edit/6d372593-e530-4405-931c-5bfcbae92abc
  - button "Delete Baz"
  - 'link "Baz #8 12 of 54 all time · 22% D L L D D Elo 1053 Skill Skill 1 of 5 This season 15 P 3 W 7 D 5 L 16 Pts"':
    - /url: /players/6d372593-e530-4405-931c-5bfcbae92abc
    - heading "Baz" [level=3]
    - text: "#8"
    - paragraph: 12 of 54 all time · 22%
    - text: D L L D D Elo 1053 Skill Skill 1 of 5
    - paragraph: This season
    - text: 15 P 3 W 7 D 5 L 16 Pts
  - link "Edit Deano":
    - /url: /players/edit/144b7561-7954-4647-b81e-c14f90147b33
  - button "Delete Deano"
  - 'link "Deano #10 16 of 52 all time · 31% D L W D D Elo 1164 Skill Skill 2 of 5 This season 15 P 1 W 7 D 7 L 10 Pts"':
    - /url: /players/144b7561-7954-4647-b81e-c14f90147b33
    - heading "Deano" [level=3]
    - text: "#10"
    - paragraph: 16 of 52 all time · 31%
    - text: D L W D D Elo 1164 Skill Skill 2 of 5
    - paragraph: This season
    - text: 15 P 1 W 7 D 7 L 10 Pts
  - link "Edit Keeper":
    - /url: /players/edit/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
  - button "Delete Keeper"
  - 'link "Keeper #5 25 of 57 all time · 44% D L L D D Elo 1298 Skill Skill 3 of 5 This season 15 P 4 W 7 D 4 L 19 Pts"':
    - /url: /players/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
    - heading "Keeper" [level=3]
    - text: "#5"
    - paragraph: 25 of 57 all time · 44%
    - text: D L L D D Elo 1298 Skill Skill 3 of 5
    - paragraph: This season
    - text: 15 P 4 W 7 D 4 L 19 Pts
  - link "Edit Macca":
    - /url: /players/edit/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
  - button "Delete Macca"
  - 'link "Macca #2 17 of 52 all time · 33% D W L D D Elo 1205 Skill Skill 4 of 5 This season 15 P 5 W 7 D 3 L 22 Pts"':
    - /url: /players/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
    - heading "Macca" [level=3]
    - text: "#2"
    - paragraph: 17 of 52 all time · 33%
    - text: D W L D D Elo 1205 Skill Skill 4 of 5
    - paragraph: This season
    - text: 15 P 5 W 7 D 3 L 22 Pts
  - link "Edit Nobby":
    - /url: /players/edit/156f2997-9fbb-4ace-bae9-8112bd9d66e5
  - button "Delete Nobby"
  - 'link "Nobby #5 19 of 57 all time · 33% D L W D D Elo 1160 Skill Skill 5 of 5 This season 15 P 4 W 7 D 4 L 19 Pts"':
    - /url: /players/156f2997-9fbb-4ace-bae9-8112bd9d66e5
    - heading "Nobby" [level=3]
    - text: "#5"
    - paragraph: 19 of 57 all time · 33%
    - text: D L W D D Elo 1160 Skill Skill 5 of 5
    - paragraph: This season
    - text: 15 P 4 W 7 D 4 L 19 Pts
  - link "Edit Ollie":
    - /url: /players/edit/a8d72639-208d-4e2c-a566-47b7a6f72bb3
  - button "Delete Ollie"
  - 'link "Ollie #2 23 of 57 all time · 40% D W W D D Elo 1282 Skill Skill 1 of 5 This season 15 P 5 W 7 D 3 L 22 Pts"':
    - /url: /players/a8d72639-208d-4e2c-a566-47b7a6f72bb3
    - heading "Ollie" [level=3]
    - text: "#2"
    - paragraph: 23 of 57 all time · 40%
    - text: D W W D D Elo 1282 Skill Skill 1 of 5
    - paragraph: This season
    - text: 15 P 5 W 7 D 3 L 22 Pts
  - link "Edit Pikey":
    - /url: /players/edit/c9c0abe4-379f-4f8c-bd6c-18b921250905
  - button "Delete Pikey"
  - 'link "Pikey #5 26 of 53 all time · 49% D W W D D Elo 1368 Skill Skill 2 of 5 This season 15 P 4 W 7 D 4 L 19 Pts"':
    - /url: /players/c9c0abe4-379f-4f8c-bd6c-18b921250905
    - heading "Pikey" [level=3]
    - text: "#5"
    - paragraph: 26 of 53 all time · 49%
    - text: D W W D D Elo 1368 Skill Skill 2 of 5
    - paragraph: This season
    - text: 15 P 4 W 7 D 4 L 19 Pts
  - link "Edit Ritchie":
    - /url: /players/edit/79e45b55-4e94-4e2f-b94a-912fae1eb57a
  - button "Delete Ritchie"
  - 'link "Ritchie #8 8 of 54 all time · 15% D W L D D Elo 973 Skill Skill 3 of 5 This season 15 P 3 W 7 D 5 L 16 Pts"':
    - /url: /players/79e45b55-4e94-4e2f-b94a-912fae1eb57a
    - heading "Ritchie" [level=3]
    - text: "#8"
    - paragraph: 8 of 54 all time · 15%
    - text: D W L D D Elo 973 Skill Skill 3 of 5
    - paragraph: This season
    - text: 15 P 3 W 7 D 5 L 16 Pts
  - link "Edit Scouse":
    - /url: /players/edit/01bd5ada-d818-4bf6-9847-87a800cd7c09
  - button "Delete Scouse"
  - 'link "Scouse #1 21 of 55 all time · 38% D W L D D Elo 1218 Skill Skill 4 of 5 This season 15 P 6 W 7 D 2 L 25 Pts"':
    - /url: /players/01bd5ada-d818-4bf6-9847-87a800cd7c09
    - heading "Scouse" [level=3]
    - text: "#1"
    - paragraph: 21 of 55 all time · 38%
    - text: D W L D D Elo 1218 Skill Skill 4 of 5
    - paragraph: This season
    - text: 15 P 6 W 7 D 2 L 25 Pts
  - link "Edit Tosh":
    - /url: /players/edit/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
  - button "Delete Tosh"
  - 'link "Tosh #2 14 of 53 all time · 26% D L W D D Elo 1128 Skill Skill 5 of 5 This season 15 P 5 W 7 D 3 L 22 Pts"':
    - /url: /players/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
    - heading "Tosh" [level=3]
    - text: "#2"
    - paragraph: 14 of 53 all time · 26%
    - text: D L W D D Elo 1128 Skill Skill 5 of 5
    - paragraph: This season
    - text: 15 P 5 W 7 D 3 L 22 Pts
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | /** Fixed by the migration that seeds it, so it can be selected directly. */
  4  | const DEMO_TEAM = "0d000000-0000-4000-8000-000000000001";
  5  | 
  6  | /**
  7  |  * The demo team is readable by anyone signed in and writable by nobody.
  8  |  *
  9  |  * The guarantee is in the database — it has no owner and no members, so every
  10 |  * policy that permits a write evaluates false. These check the app agrees:
  11 |  * that the data actually arrives, that it is announced as a demo rather than
  12 |  * looking like your own squad, and that nothing offers to change it.
  13 |  */
  14 | test.beforeEach(async ({ page }) => {
  15 |   await page.addInitScript((id) => {
  16 |     window.localStorage.setItem("currentTeamId", id);
  17 |   }, DEMO_TEAM);
  18 | });
  19 | 
  20 | test("shows the demo squad and says that is what it is", async ({ page }) => {
  21 |   await page.goto("/players");
  22 |   await page.waitForLoadState("networkidle");
  23 | 
> 24 |   await expect(page.getByText(/looking at the demo team/i)).toBeVisible();
     |                                                             ^ Error: expect(locator).toBeVisible() failed
  25 | 
  26 |   // The seeded squad, not an empty state.
  27 |   await expect(page.getByRole("heading", { name: "Ade" })).toBeVisible();
  28 |   await expect(page.getByRole("heading", { name: "Baz" })).toBeVisible();
  29 | });
  30 | 
  31 | test("offers nothing that would change it", async ({ page }) => {
  32 |   await page.goto("/players");
  33 |   await page.waitForLoadState("networkidle");
  34 | 
  35 |   // Adding, editing and deleting are all admin-only, and nobody is an admin of
  36 |   // a team with no members.
  37 |   await expect(page.getByRole("link", { name: /add player/i })).toHaveCount(0);
  38 |   await expect(page.getByRole("link", { name: /^edit /i })).toHaveCount(0);
  39 |   await expect(page.getByRole("button", { name: /^delete /i })).toHaveCount(0);
  40 | });
  41 | 
  42 | test("keeps the results and the table", async ({ page }) => {
  43 |   await page.goto("/matches");
  44 |   await page.waitForLoadState("networkidle");
  45 |   await expect(page.getByRole("listitem").first()).toBeVisible();
  46 | 
  47 |   await page.goto("/seasons");
  48 |   await page.waitForLoadState("networkidle");
  49 |   await expect(page.getByText("Autumn").first()).toBeVisible();
  50 | });
  51 | 
  52 | test("does not name anybody else in it", async ({ page }) => {
  53 |   await page.goto("/team");
  54 |   await page.waitForLoadState("networkidle");
  55 | 
  56 |   // `team_members` has no demo policy, so the roster is as private as any
  57 |   // other team's — the page renders, and lists nobody.
  58 |   await expect(page.getByText(/looking at the demo team/i)).toBeVisible();
  59 |   await expect(page.getByRole("cell", { name: /@/ })).toHaveCount(0);
  60 | });
  61 | 
```