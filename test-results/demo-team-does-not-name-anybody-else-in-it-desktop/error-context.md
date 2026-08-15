# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-team.spec.ts >> does not name anybody else in it
- Location: e2e\demo-team.spec.ts:52:1

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
  - heading "Team" [level=1]
  - paragraph: Who is in the squad, and who can change it
  - button "Create New Team"
  - heading "Team Members" [level=3]
  - paragraph: Manage members of Thursday Nighters
  - table:
    - rowgroup:
      - row "User Role Joined Actions":
        - columnheader "User"
        - columnheader "Role"
        - columnheader "Joined"
        - columnheader "Actions"
    - rowgroup:
      - row "Unknown User(You) Admin 15/08/2026":
        - cell "Unknown User(You)"
        - cell "Admin"
        - cell "15/08/2026"
        - cell
  - heading "Share team" [level=3]
  - paragraph: Share your team with others
  - heading "Share Team" [level=3]
  - paragraph: Share this ID to invite others to join your team
  - textbox: 849f70a5-7ccd-4f1d-818a-4505cdac2bf0
  - button
  - button "Share Team"
  - paragraph: Users can join your team by entering this ID in their Join Team form.
  - heading "Side names" [level=3]
  - paragraph: Used when picking the teams, on every match, and in the league table.
  - text: First side
  - textbox "First side": Bibs
  - text: Second side
  - textbox "Second side": No bibs
  - paragraph: Tonight it would read Bibs v No bibs.
  - button "Save names" [disabled]
  - heading "Invite member" [level=3]
  - paragraph: Add new members to your team
  - text: Email
  - textbox "Email":
    - /placeholder: user@example.com
  - text: Role
  - combobox "Role": Viewer
  - button "Invite Member"
  - heading "Create New Team" [level=3]
  - paragraph: Start a fresh team for your players and matches
  - button "Create New Team"
  - heading "Join Existing Team" [level=3]
  - paragraph: Enter a team ID to join as a member
  - textbox "Enter team ID"
  - button "Join Team" [disabled]
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
  24 |   await expect(page.getByText(/looking at the demo team/i)).toBeVisible();
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
> 58 |   await expect(page.getByText(/looking at the demo team/i)).toBeVisible();
     |                                                             ^ Error: expect(locator).toBeVisible() failed
  59 |   await expect(page.getByRole("cell", { name: /@/ })).toHaveCount(0);
  60 | });
  61 | 
```