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
  - link "Ratings":
    - /url: /ratings
  - link "Compare":
    - /url: /compare
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
  - heading "Players" [level=1]
  - paragraph: The squad, their records and their form
  - heading "Summer 2026" [level=3]
  - paragraph: Current season · 23/04/2026 – ongoing
  - text: 12 have featured
  - link "View the league table":
    - /url: /seasons/5b91a6b6-5a6e-4f6b-af95-59ec795ff9f0
  - textbox "Search players..."
  - group "Which players to show":
    - text: Which players to show
    - button "Active 10" [pressed]
    - button "Everyone 12"
  - link "Add player":
    - /url: /players/add
  - link "Edit Baz":
    - /url: /players/edit/374e83eb-e755-412b-9091-2484fcaec94c
  - button "Delete Baz"
  - 'link "Baz #9 11 of 48 all time · 23% L W W D Elo 1107 Skill Skill 1 of 5 This season 10 P 3 W 5 D 2 L 14 Pts"':
    - /url: /players/374e83eb-e755-412b-9091-2484fcaec94c
    - heading "Baz" [level=3]
    - text: "#9"
    - paragraph: 11 of 48 all time · 23%
    - text: L W W D Elo 1107 Skill Skill 1 of 5
    - paragraph: This season
    - text: 10 P 3 W 5 D 2 L 14 Pts
  - link "Edit Deano":
    - /url: /players/edit/b97dba2e-a8b2-4245-82d9-38768c5ce35a
  - button "Delete Deano"
  - 'link "Deano #11 14 of 50 all time · 28% L L L L Elo 1182 Skill Skill 2 of 5 This season 14 P 2 W 5 D 7 L 11 Pts"':
    - /url: /players/b97dba2e-a8b2-4245-82d9-38768c5ce35a
    - heading "Deano" [level=3]
    - text: "#11"
    - paragraph: 14 of 50 all time · 28%
    - text: L L L L Elo 1182 Skill Skill 2 of 5
    - paragraph: This season
    - text: 14 P 2 W 5 D 7 L 11 Pts
  - link "Edit Keeper":
    - /url: /players/edit/9a3f246c-c0c6-414e-9a16-3f260f88192a
  - button "Delete Keeper"
  - 'link "Keeper #1 22 of 52 all time · 42% W W W L D Elo 1287 Skill Skill 3 of 5 This season 14 P 6 W 5 D 3 L 23 Pts"':
    - /url: /players/9a3f246c-c0c6-414e-9a16-3f260f88192a
    - heading "Keeper" [level=3]
    - text: "#1"
    - paragraph: 22 of 52 all time · 42%
    - text: W W W L D Elo 1287 Skill Skill 3 of 5
    - paragraph: This season
    - text: 14 P 6 W 5 D 3 L 23 Pts
  - link "Edit Macca":
    - /url: /players/edit/a7d08d89-695c-45af-8142-e5a4c01887e0
  - button "Delete Macca"
  - 'link "Macca #8 13 of 49 all time · 27% L W L D Elo 1142 Skill Skill 4 of 5 This season 14 P 3 W 6 D 5 L 15 Pts"':
    - /url: /players/a7d08d89-695c-45af-8142-e5a4c01887e0
    - heading "Macca" [level=3]
    - text: "#8"
    - paragraph: 13 of 49 all time · 27%
    - text: L W L D Elo 1142 Skill Skill 4 of 5
    - paragraph: This season
    - text: 14 P 3 W 6 D 5 L 15 Pts
  - link "Edit Nobby":
    - /url: /players/edit/3bf995fb-4c06-47a9-a01e-fd5a946280e5
  - button "Delete Nobby"
  - 'link "Nobby #5 15 of 55 all time · 27% W L W L D Elo 1121 Skill Skill 5 of 5 This season 14 P 4 W 5 D 5 L 17 Pts"':
    - /url: /players/3bf995fb-4c06-47a9-a01e-fd5a946280e5
    - heading "Nobby" [level=3]
    - text: "#5"
    - paragraph: 15 of 55 all time · 27%
    - text: W L W L D Elo 1121 Skill Skill 5 of 5
    - paragraph: This season
    - text: 14 P 4 W 5 D 5 L 17 Pts
  - link "Edit Ollie":
    - /url: /players/edit/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
  - button "Delete Ollie"
  - 'link "Ollie #10 18 of 48 all time · 38% W L D Elo 1280 Skill Skill 1 of 5 This season 10 P 3 W 4 D 3 L 13 Pts"':
    - /url: /players/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
    - heading "Ollie" [level=3]
    - text: "#10"
    - paragraph: 18 of 48 all time · 38%
    - text: W L D Elo 1280 Skill Skill 1 of 5
    - paragraph: This season
    - text: 10 P 3 W 4 D 3 L 13 Pts
  - link "Edit Pikey":
    - /url: /players/edit/73086dd7-ceea-4607-9071-3dbf0296f1bb
  - button "Delete Pikey"
  - 'link "Pikey #3 21 of 45 all time · 47% W W L W D Elo 1351 Skill Skill 2 of 5 This season 11 P 5 W 5 D 1 L 20 Pts"':
    - /url: /players/73086dd7-ceea-4607-9071-3dbf0296f1bb
    - heading "Pikey" [level=3]
    - text: "#3"
    - paragraph: 21 of 45 all time · 47%
    - text: W W L W D Elo 1351 Skill Skill 2 of 5
    - paragraph: This season
    - text: 11 P 5 W 5 D 1 L 20 Pts
  - link "Edit Ritchie":
    - /url: /players/edit/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
  - button "Delete Ritchie"
  - 'link "Ritchie #12 7 of 45 all time · 16% L L Elo 1030 Skill Skill 3 of 5 This season 8 P 2 W 3 D 3 L 9 Pts"':
    - /url: /players/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
    - heading "Ritchie" [level=3]
    - text: "#12"
    - paragraph: 7 of 45 all time · 16%
    - text: L L Elo 1030 Skill Skill 3 of 5
    - paragraph: This season
    - text: 8 P 2 W 3 D 3 L 9 Pts
  - link "Edit Scouse":
    - /url: /players/edit/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
  - button "Delete Scouse"
  - 'link "Scouse #4 17 of 54 all time · 31% L W W W D Elo 1171 Skill Skill 4 of 5 This season 15 P 4 W 6 D 5 L 18 Pts"':
    - /url: /players/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
    - heading "Scouse" [level=3]
    - text: "#4"
    - paragraph: 17 of 54 all time · 31%
    - text: L W W W D Elo 1171 Skill Skill 4 of 5
    - paragraph: This season
    - text: 15 P 4 W 6 D 5 L 18 Pts
  - link "Edit Tosh":
    - /url: /players/edit/4797c47e-f158-4d54-ac45-d9a061669871
  - button "Delete Tosh"
  - 'link "Tosh #2 14 of 51 all time · 27% W W L D Elo 1166 Skill Skill 5 of 5 This season 14 P 5 W 6 D 3 L 21 Pts"':
    - /url: /players/4797c47e-f158-4d54-ac45-d9a061669871
    - heading "Tosh" [level=3]
    - text: "#2"
    - paragraph: 14 of 51 all time · 27%
    - text: W W L D Elo 1166 Skill Skill 5 of 5
    - paragraph: This season
    - text: 14 P 5 W 6 D 3 L 21 Pts
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