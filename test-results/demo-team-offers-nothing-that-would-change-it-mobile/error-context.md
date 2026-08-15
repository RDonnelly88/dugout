# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo-team.spec.ts >> offers nothing that would change it
- Location: e2e\demo-team.spec.ts:31:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('link', { name: /add player/i })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByRole('link', { name: /add player/i })
    13 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - button "Open navigation" [ref=e5]
      - generic [ref=e6]: Thursday Nighters
    - generic [ref=e13]:
      - generic [ref=e16]:
        - heading "Players" [level=1] [ref=e18]
        - paragraph [ref=e19]: The squad, their records and their form
      - generic [ref=e20]:
        - generic [ref=e21]:
          - heading "Summer 2026" [level=3] [ref=e22]
          - paragraph [ref=e30]: Current season · 23/04/2026 – ongoing
        - generic [ref=e32]:
          - generic [ref=e33]: 12 have featured
          - link "View the league table" [ref=e36]:
            - /url: /seasons/5b91a6b6-5a6e-4f6b-af95-59ec795ff9f0
      - generic [ref=e37]:
        - generic [ref=e38]:
          - textbox "Search players..." [ref=e43]
          - group "Which players to show" [ref=e44]:
            - button "Active 10" [pressed] [ref=e46]:
              - text: Active
              - generic [ref=e51]: "10"
            - button "Everyone 12" [ref=e52]:
              - text: Everyone
              - generic [ref=e58]: "12"
        - link "Add player" [ref=e59]:
          - /url: /players/add
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - link "Edit Baz" [ref=e63]:
              - /url: /players/edit/374e83eb-e755-412b-9091-2484fcaec94c
            - button "Delete Baz" [ref=e67]
          - 'link "Baz #9 11 of 48 all time · 23% L W W D Elo 1107 Skill Skill 1 of 5 This season 10 P 3 W 5 D 2 L 14 Pts" [ref=e71]':
            - /url: /players/374e83eb-e755-412b-9091-2484fcaec94c
            - generic [ref=e72]:
              - generic [ref=e73]:
                - generic [ref=e74]: B
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - heading "Baz" [level=3] [ref=e78]
                    - generic [ref=e79]: "#9"
                  - paragraph [ref=e80]: 11 of 48 all time · 23%
                  - generic [ref=e83]:
                    - generic "Did Not Play" [ref=e84]
                    - generic "Loss" [ref=e90]: L
                    - generic "Win" [ref=e91]: W
                    - generic "Win" [ref=e92]: W
                    - generic "Draw" [ref=e93]: D
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - generic [ref=e96]: Elo
                  - generic [ref=e97]: "1107"
                - generic [ref=e98]:
                  - generic [ref=e99]: Skill
                  - generic [ref=e100]: Skill 1 of 5
              - generic [ref=e107]:
                - paragraph [ref=e108]: This season
                - generic [ref=e109]:
                  - generic [ref=e110]:
                    - generic [ref=e111]: "10"
                    - generic [ref=e112]: P
                  - generic [ref=e113]:
                    - generic [ref=e114]: "3"
                    - generic [ref=e115]: W
                  - generic [ref=e116]:
                    - generic [ref=e117]: "5"
                    - generic [ref=e118]: D
                  - generic [ref=e119]:
                    - generic [ref=e120]: "2"
                    - generic [ref=e121]: L
                  - generic [ref=e122]:
                    - generic [ref=e123]: "14"
                    - generic [ref=e124]: Pts
        - generic [ref=e125]:
          - generic [ref=e126]:
            - link "Edit Deano" [ref=e127]:
              - /url: /players/edit/b97dba2e-a8b2-4245-82d9-38768c5ce35a
            - button "Delete Deano" [ref=e131]
          - 'link "Deano #11 14 of 50 all time · 28% L L L L Elo 1182 Skill Skill 2 of 5 This season 14 P 2 W 5 D 7 L 11 Pts" [ref=e135]':
            - /url: /players/b97dba2e-a8b2-4245-82d9-38768c5ce35a
            - generic [ref=e136]:
              - generic [ref=e137]:
                - generic [ref=e138]: D
                - generic [ref=e140]:
                  - generic [ref=e141]:
                    - heading "Deano" [level=3] [ref=e142]
                    - generic [ref=e143]: "#11"
                  - paragraph [ref=e144]: 14 of 50 all time · 28%
                  - generic [ref=e147]:
                    - generic "Loss" [ref=e148]: L
                    - generic "Loss" [ref=e149]: L
                    - generic "Loss" [ref=e150]: L
                    - generic "Loss" [ref=e151]: L
                    - generic "Did Not Play" [ref=e152]
              - generic [ref=e158]:
                - generic [ref=e159]:
                  - generic [ref=e160]: Elo
                  - generic [ref=e161]: "1182"
                - generic [ref=e162]:
                  - generic [ref=e163]: Skill
                  - generic [ref=e164]: Skill 2 of 5
              - generic [ref=e171]:
                - paragraph [ref=e172]: This season
                - generic [ref=e173]:
                  - generic [ref=e174]:
                    - generic [ref=e175]: "14"
                    - generic [ref=e176]: P
                  - generic [ref=e177]:
                    - generic [ref=e178]: "2"
                    - generic [ref=e179]: W
                  - generic [ref=e180]:
                    - generic [ref=e181]: "5"
                    - generic [ref=e182]: D
                  - generic [ref=e183]:
                    - generic [ref=e184]: "7"
                    - generic [ref=e185]: L
                  - generic [ref=e186]:
                    - generic [ref=e187]: "11"
                    - generic [ref=e188]: Pts
        - generic [ref=e189]:
          - generic [ref=e190]:
            - link "Edit Keeper" [ref=e191]:
              - /url: /players/edit/9a3f246c-c0c6-414e-9a16-3f260f88192a
            - button "Delete Keeper" [ref=e195]
          - 'link "Keeper #1 22 of 52 all time · 42% W W W L D Elo 1287 Skill Skill 3 of 5 This season 14 P 6 W 5 D 3 L 23 Pts" [ref=e199]':
            - /url: /players/9a3f246c-c0c6-414e-9a16-3f260f88192a
            - generic [ref=e200]:
              - generic [ref=e201]:
                - generic [ref=e202]: K
                - generic [ref=e204]:
                  - generic [ref=e205]:
                    - heading "Keeper" [level=3] [ref=e206]
                    - generic [ref=e207]: "#1"
                  - paragraph [ref=e208]: 22 of 52 all time · 42%
                  - generic [ref=e211]:
                    - generic "Win" [ref=e212]: W
                    - generic "Win" [ref=e213]: W
                    - generic "Win" [ref=e214]: W
                    - generic "Loss" [ref=e215]: L
                    - generic "Draw" [ref=e216]: D
              - generic [ref=e217]:
                - generic [ref=e218]:
                  - generic [ref=e219]: Elo
                  - generic [ref=e220]: "1287"
                - generic [ref=e221]:
                  - generic [ref=e222]: Skill
                  - generic [ref=e223]: Skill 3 of 5
              - generic [ref=e230]:
                - paragraph [ref=e231]: This season
                - generic [ref=e232]:
                  - generic [ref=e233]:
                    - generic [ref=e234]: "14"
                    - generic [ref=e235]: P
                  - generic [ref=e236]:
                    - generic [ref=e237]: "6"
                    - generic [ref=e238]: W
                  - generic [ref=e239]:
                    - generic [ref=e240]: "5"
                    - generic [ref=e241]: D
                  - generic [ref=e242]:
                    - generic [ref=e243]: "3"
                    - generic [ref=e244]: L
                  - generic [ref=e245]:
                    - generic [ref=e246]: "23"
                    - generic [ref=e247]: Pts
        - generic [ref=e248]:
          - generic [ref=e249]:
            - link "Edit Macca" [ref=e250]:
              - /url: /players/edit/a7d08d89-695c-45af-8142-e5a4c01887e0
            - button "Delete Macca" [ref=e254]
          - 'link "Macca #8 13 of 49 all time · 27% L W L D Elo 1142 Skill Skill 4 of 5 This season 14 P 3 W 6 D 5 L 15 Pts" [ref=e258]':
            - /url: /players/a7d08d89-695c-45af-8142-e5a4c01887e0
            - generic [ref=e259]:
              - generic [ref=e260]:
                - generic [ref=e261]: M
                - generic [ref=e263]:
                  - generic [ref=e264]:
                    - heading "Macca" [level=3] [ref=e265]
                    - generic [ref=e266]: "#8"
                  - paragraph [ref=e267]: 13 of 49 all time · 27%
                  - generic [ref=e270]:
                    - generic "Loss" [ref=e271]: L
                    - generic "Did Not Play" [ref=e272]
                    - generic "Win" [ref=e278]: W
                    - generic "Loss" [ref=e279]: L
                    - generic "Draw" [ref=e280]: D
              - generic [ref=e281]:
                - generic [ref=e282]:
                  - generic [ref=e283]: Elo
                  - generic [ref=e284]: "1142"
                - generic [ref=e285]:
                  - generic [ref=e286]: Skill
                  - generic [ref=e287]: Skill 4 of 5
              - generic [ref=e294]:
                - paragraph [ref=e295]: This season
                - generic [ref=e296]:
                  - generic [ref=e297]:
                    - generic [ref=e298]: "14"
                    - generic [ref=e299]: P
                  - generic [ref=e300]:
                    - generic [ref=e301]: "3"
                    - generic [ref=e302]: W
                  - generic [ref=e303]:
                    - generic [ref=e304]: "6"
                    - generic [ref=e305]: D
                  - generic [ref=e306]:
                    - generic [ref=e307]: "5"
                    - generic [ref=e308]: L
                  - generic [ref=e309]:
                    - generic [ref=e310]: "15"
                    - generic [ref=e311]: Pts
        - generic [ref=e312]:
          - generic [ref=e313]:
            - link "Edit Nobby" [ref=e314]:
              - /url: /players/edit/3bf995fb-4c06-47a9-a01e-fd5a946280e5
            - button "Delete Nobby" [ref=e318]
          - 'link "Nobby #5 15 of 55 all time · 27% W L W L D Elo 1121 Skill Skill 5 of 5 This season 14 P 4 W 5 D 5 L 17 Pts" [ref=e322]':
            - /url: /players/3bf995fb-4c06-47a9-a01e-fd5a946280e5
            - generic [ref=e323]:
              - generic [ref=e324]:
                - generic [ref=e325]: "N"
                - generic [ref=e327]:
                  - generic [ref=e328]:
                    - heading "Nobby" [level=3] [ref=e329]
                    - generic [ref=e330]: "#5"
                  - paragraph [ref=e331]: 15 of 55 all time · 27%
                  - generic [ref=e334]:
                    - generic "Win" [ref=e335]: W
                    - generic "Loss" [ref=e336]: L
                    - generic "Win" [ref=e337]: W
                    - generic "Loss" [ref=e338]: L
                    - generic "Draw" [ref=e339]: D
              - generic [ref=e340]:
                - generic [ref=e341]:
                  - generic [ref=e342]: Elo
                  - generic [ref=e343]: "1121"
                - generic [ref=e344]:
                  - generic [ref=e345]: Skill
                  - generic [ref=e346]: Skill 5 of 5
              - generic [ref=e353]:
                - paragraph [ref=e354]: This season
                - generic [ref=e355]:
                  - generic [ref=e356]:
                    - generic [ref=e357]: "14"
                    - generic [ref=e358]: P
                  - generic [ref=e359]:
                    - generic [ref=e360]: "4"
                    - generic [ref=e361]: W
                  - generic [ref=e362]:
                    - generic [ref=e363]: "5"
                    - generic [ref=e364]: D
                  - generic [ref=e365]:
                    - generic [ref=e366]: "5"
                    - generic [ref=e367]: L
                  - generic [ref=e368]:
                    - generic [ref=e369]: "17"
                    - generic [ref=e370]: Pts
        - generic [ref=e371]:
          - generic [ref=e372]:
            - link "Edit Ollie" [ref=e373]:
              - /url: /players/edit/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
            - button "Delete Ollie" [ref=e377]
          - 'link "Ollie #10 18 of 48 all time · 38% W L D Elo 1280 Skill Skill 1 of 5 This season 10 P 3 W 4 D 3 L 13 Pts" [ref=e381]':
            - /url: /players/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
            - generic [ref=e382]:
              - generic [ref=e383]:
                - generic [ref=e384]: O
                - generic [ref=e386]:
                  - generic [ref=e387]:
                    - heading "Ollie" [level=3] [ref=e388]
                    - generic [ref=e389]: "#10"
                  - paragraph [ref=e390]: 18 of 48 all time · 38%
                  - generic [ref=e393]:
                    - generic "Did Not Play" [ref=e394]
                    - generic "Win" [ref=e400]: W
                    - generic "Loss" [ref=e401]: L
                    - generic "Did Not Play" [ref=e402]
                    - generic "Draw" [ref=e408]: D
              - generic [ref=e409]:
                - generic [ref=e410]:
                  - generic [ref=e411]: Elo
                  - generic [ref=e412]: "1280"
                - generic [ref=e413]:
                  - generic [ref=e414]: Skill
                  - generic [ref=e415]: Skill 1 of 5
              - generic [ref=e422]:
                - paragraph [ref=e423]: This season
                - generic [ref=e424]:
                  - generic [ref=e425]:
                    - generic [ref=e426]: "10"
                    - generic [ref=e427]: P
                  - generic [ref=e428]:
                    - generic [ref=e429]: "3"
                    - generic [ref=e430]: W
                  - generic [ref=e431]:
                    - generic [ref=e432]: "4"
                    - generic [ref=e433]: D
                  - generic [ref=e434]:
                    - generic [ref=e435]: "3"
                    - generic [ref=e436]: L
                  - generic [ref=e437]:
                    - generic [ref=e438]: "13"
                    - generic [ref=e439]: Pts
        - generic [ref=e440]:
          - generic [ref=e441]:
            - link "Edit Pikey" [ref=e442]:
              - /url: /players/edit/73086dd7-ceea-4607-9071-3dbf0296f1bb
            - button "Delete Pikey" [ref=e446]
          - 'link "Pikey #3 21 of 45 all time · 47% W W L W D Elo 1351 Skill Skill 2 of 5 This season 11 P 5 W 5 D 1 L 20 Pts" [ref=e450]':
            - /url: /players/73086dd7-ceea-4607-9071-3dbf0296f1bb
            - generic [ref=e451]:
              - generic [ref=e452]:
                - generic [ref=e453]: P
                - generic [ref=e455]:
                  - generic [ref=e456]:
                    - heading "Pikey" [level=3] [ref=e457]
                    - generic [ref=e458]: "#3"
                  - paragraph [ref=e459]: 21 of 45 all time · 47%
                  - generic [ref=e462]:
                    - generic "Win" [ref=e463]: W
                    - generic "Win" [ref=e464]: W
                    - generic "Loss" [ref=e465]: L
                    - generic "Win" [ref=e466]: W
                    - generic "Draw" [ref=e467]: D
              - generic [ref=e468]:
                - generic [ref=e469]:
                  - generic [ref=e470]: Elo
                  - generic [ref=e471]: "1351"
                - generic [ref=e472]:
                  - generic [ref=e473]: Skill
                  - generic [ref=e474]: Skill 2 of 5
              - generic [ref=e481]:
                - paragraph [ref=e482]: This season
                - generic [ref=e483]:
                  - generic [ref=e484]:
                    - generic [ref=e485]: "11"
                    - generic [ref=e486]: P
                  - generic [ref=e487]:
                    - generic [ref=e488]: "5"
                    - generic [ref=e489]: W
                  - generic [ref=e490]:
                    - generic [ref=e491]: "5"
                    - generic [ref=e492]: D
                  - generic [ref=e493]:
                    - generic [ref=e494]: "1"
                    - generic [ref=e495]: L
                  - generic [ref=e496]:
                    - generic [ref=e497]: "20"
                    - generic [ref=e498]: Pts
        - generic [ref=e499]:
          - generic [ref=e500]:
            - link "Edit Ritchie" [ref=e501]:
              - /url: /players/edit/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
            - button "Delete Ritchie" [ref=e505]
          - 'link "Ritchie #12 7 of 45 all time · 16% L L Elo 1030 Skill Skill 3 of 5 This season 8 P 2 W 3 D 3 L 9 Pts" [ref=e509]':
            - /url: /players/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
            - generic [ref=e510]:
              - generic [ref=e511]:
                - generic [ref=e512]: R
                - generic [ref=e514]:
                  - generic [ref=e515]:
                    - heading "Ritchie" [level=3] [ref=e516]
                    - generic [ref=e517]: "#12"
                  - paragraph [ref=e518]: 7 of 45 all time · 16%
                  - generic [ref=e521]:
                    - generic "Loss" [ref=e522]: L
                    - generic "Did Not Play" [ref=e523]
                    - generic "Loss" [ref=e529]: L
                    - generic "Did Not Play" [ref=e530]
                    - generic "Did Not Play" [ref=e536]
              - generic [ref=e542]:
                - generic [ref=e543]:
                  - generic [ref=e544]: Elo
                  - generic [ref=e545]: "1030"
                - generic [ref=e546]:
                  - generic [ref=e547]: Skill
                  - generic [ref=e548]: Skill 3 of 5
              - generic [ref=e555]:
                - paragraph [ref=e556]: This season
                - generic [ref=e557]:
                  - generic [ref=e558]:
                    - generic [ref=e559]: "8"
                    - generic [ref=e560]: P
                  - generic [ref=e561]:
                    - generic [ref=e562]: "2"
                    - generic [ref=e563]: W
                  - generic [ref=e564]:
                    - generic [ref=e565]: "3"
                    - generic [ref=e566]: D
                  - generic [ref=e567]:
                    - generic [ref=e568]: "3"
                    - generic [ref=e569]: L
                  - generic [ref=e570]:
                    - generic [ref=e571]: "9"
                    - generic [ref=e572]: Pts
        - generic [ref=e573]:
          - generic [ref=e574]:
            - link "Edit Scouse" [ref=e575]:
              - /url: /players/edit/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
            - button "Delete Scouse" [ref=e579]
          - 'link "Scouse #4 17 of 54 all time · 31% L W W W D Elo 1171 Skill Skill 4 of 5 This season 15 P 4 W 6 D 5 L 18 Pts" [ref=e583]':
            - /url: /players/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
            - generic [ref=e584]:
              - generic [ref=e585]:
                - generic [ref=e586]: S
                - generic [ref=e588]:
                  - generic [ref=e589]:
                    - heading "Scouse" [level=3] [ref=e590]
                    - generic [ref=e591]: "#4"
                  - paragraph [ref=e592]: 17 of 54 all time · 31%
                  - generic [ref=e595]:
                    - generic "Loss" [ref=e596]: L
                    - generic "Win" [ref=e597]: W
                    - generic "Win" [ref=e598]: W
                    - generic "Win" [ref=e599]: W
                    - generic "Draw" [ref=e600]: D
              - generic [ref=e601]:
                - generic [ref=e602]:
                  - generic [ref=e603]: Elo
                  - generic [ref=e604]: "1171"
                - generic [ref=e605]:
                  - generic [ref=e606]: Skill
                  - generic [ref=e607]: Skill 4 of 5
              - generic [ref=e614]:
                - paragraph [ref=e615]: This season
                - generic [ref=e616]:
                  - generic [ref=e617]:
                    - generic [ref=e618]: "15"
                    - generic [ref=e619]: P
                  - generic [ref=e620]:
                    - generic [ref=e621]: "4"
                    - generic [ref=e622]: W
                  - generic [ref=e623]:
                    - generic [ref=e624]: "6"
                    - generic [ref=e625]: D
                  - generic [ref=e626]:
                    - generic [ref=e627]: "5"
                    - generic [ref=e628]: L
                  - generic [ref=e629]:
                    - generic [ref=e630]: "18"
                    - generic [ref=e631]: Pts
        - generic [ref=e632]:
          - generic [ref=e633]:
            - link "Edit Tosh" [ref=e634]:
              - /url: /players/edit/4797c47e-f158-4d54-ac45-d9a061669871
            - button "Delete Tosh" [ref=e638]
          - 'link "Tosh #2 14 of 51 all time · 27% W W L D Elo 1166 Skill Skill 5 of 5 This season 14 P 5 W 6 D 3 L 21 Pts" [ref=e642]':
            - /url: /players/4797c47e-f158-4d54-ac45-d9a061669871
            - generic [ref=e643]:
              - generic [ref=e644]:
                - generic [ref=e645]: T
                - generic [ref=e647]:
                  - generic [ref=e648]:
                    - heading "Tosh" [level=3] [ref=e649]
                    - generic [ref=e650]: "#2"
                  - paragraph [ref=e651]: 14 of 51 all time · 27%
                  - generic [ref=e654]:
                    - generic "Win" [ref=e655]: W
                    - generic "Win" [ref=e656]: W
                    - generic "Did Not Play" [ref=e657]
                    - generic "Loss" [ref=e663]: L
                    - generic "Draw" [ref=e664]: D
              - generic [ref=e665]:
                - generic [ref=e666]:
                  - generic [ref=e667]: Elo
                  - generic [ref=e668]: "1166"
                - generic [ref=e669]:
                  - generic [ref=e670]: Skill
                  - generic [ref=e671]: Skill 5 of 5
              - generic [ref=e678]:
                - paragraph [ref=e679]: This season
                - generic [ref=e680]:
                  - generic [ref=e681]:
                    - generic [ref=e682]: "14"
                    - generic [ref=e683]: P
                  - generic [ref=e684]:
                    - generic [ref=e685]: "5"
                    - generic [ref=e686]: W
                  - generic [ref=e687]:
                    - generic [ref=e688]: "6"
                    - generic [ref=e689]: D
                  - generic [ref=e690]:
                    - generic [ref=e691]: "3"
                    - generic [ref=e692]: L
                  - generic [ref=e693]:
                    - generic [ref=e694]: "21"
                    - generic [ref=e695]: Pts
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e701] [cursor=pointer]
  - alert [ref=e707]
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
> 37 |   await expect(page.getByRole("link", { name: /add player/i })).toHaveCount(0);
     |                                                                 ^ Error: expect(locator).toHaveCount(expected) failed
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