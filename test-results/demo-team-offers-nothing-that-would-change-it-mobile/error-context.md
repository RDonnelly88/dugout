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
          - generic [ref=e33]: 10 have featured
          - link "View the league table" [ref=e36]:
            - /url: /seasons/25c7ade6-ca02-45e6-8d88-b63d83e54b88
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
              - /url: /players/edit/6d372593-e530-4405-931c-5bfcbae92abc
            - button "Delete Baz" [ref=e67]
          - 'link "Baz #8 12 of 54 all time · 22% D L L D D Elo 1053 Skill Skill 1 of 5 This season 15 P 3 W 7 D 5 L 16 Pts" [ref=e71]':
            - /url: /players/6d372593-e530-4405-931c-5bfcbae92abc
            - generic [ref=e72]:
              - generic [ref=e73]:
                - generic [ref=e74]: B
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - heading "Baz" [level=3] [ref=e78]
                    - generic [ref=e79]: "#8"
                  - paragraph [ref=e80]: 12 of 54 all time · 22%
                  - generic [ref=e83]:
                    - generic "Draw" [ref=e84]: D
                    - generic "Loss" [ref=e85]: L
                    - generic "Loss" [ref=e86]: L
                    - generic "Draw" [ref=e87]: D
                    - generic "Draw" [ref=e88]: D
              - generic [ref=e89]:
                - generic [ref=e90]:
                  - generic [ref=e91]: Elo
                  - generic [ref=e92]: "1053"
                - generic [ref=e93]:
                  - generic [ref=e94]: Skill
                  - generic [ref=e95]: Skill 1 of 5
              - generic [ref=e102]:
                - paragraph [ref=e103]: This season
                - generic [ref=e104]:
                  - generic [ref=e105]:
                    - generic [ref=e106]: "15"
                    - generic [ref=e107]: P
                  - generic [ref=e108]:
                    - generic [ref=e109]: "3"
                    - generic [ref=e110]: W
                  - generic [ref=e111]:
                    - generic [ref=e112]: "7"
                    - generic [ref=e113]: D
                  - generic [ref=e114]:
                    - generic [ref=e115]: "5"
                    - generic [ref=e116]: L
                  - generic [ref=e117]:
                    - generic [ref=e118]: "16"
                    - generic [ref=e119]: Pts
        - generic [ref=e120]:
          - generic [ref=e121]:
            - link "Edit Deano" [ref=e122]:
              - /url: /players/edit/144b7561-7954-4647-b81e-c14f90147b33
            - button "Delete Deano" [ref=e126]
          - 'link "Deano #10 16 of 52 all time · 31% D L W D D Elo 1164 Skill Skill 2 of 5 This season 15 P 1 W 7 D 7 L 10 Pts" [ref=e130]':
            - /url: /players/144b7561-7954-4647-b81e-c14f90147b33
            - generic [ref=e131]:
              - generic [ref=e132]:
                - generic [ref=e133]: D
                - generic [ref=e135]:
                  - generic [ref=e136]:
                    - heading "Deano" [level=3] [ref=e137]
                    - generic [ref=e138]: "#10"
                  - paragraph [ref=e139]: 16 of 52 all time · 31%
                  - generic [ref=e142]:
                    - generic "Draw" [ref=e143]: D
                    - generic "Loss" [ref=e144]: L
                    - generic "Win" [ref=e145]: W
                    - generic "Draw" [ref=e146]: D
                    - generic "Draw" [ref=e147]: D
              - generic [ref=e148]:
                - generic [ref=e149]:
                  - generic [ref=e150]: Elo
                  - generic [ref=e151]: "1164"
                - generic [ref=e152]:
                  - generic [ref=e153]: Skill
                  - generic [ref=e154]: Skill 2 of 5
              - generic [ref=e161]:
                - paragraph [ref=e162]: This season
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - generic [ref=e165]: "15"
                    - generic [ref=e166]: P
                  - generic [ref=e167]:
                    - generic [ref=e168]: "1"
                    - generic [ref=e169]: W
                  - generic [ref=e170]:
                    - generic [ref=e171]: "7"
                    - generic [ref=e172]: D
                  - generic [ref=e173]:
                    - generic [ref=e174]: "7"
                    - generic [ref=e175]: L
                  - generic [ref=e176]:
                    - generic [ref=e177]: "10"
                    - generic [ref=e178]: Pts
        - generic [ref=e179]:
          - generic [ref=e180]:
            - link "Edit Keeper" [ref=e181]:
              - /url: /players/edit/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
            - button "Delete Keeper" [ref=e185]
          - 'link "Keeper #5 25 of 57 all time · 44% D L L D D Elo 1298 Skill Skill 3 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e189]':
            - /url: /players/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
            - generic [ref=e190]:
              - generic [ref=e191]:
                - generic [ref=e192]: K
                - generic [ref=e194]:
                  - generic [ref=e195]:
                    - heading "Keeper" [level=3] [ref=e196]
                    - generic [ref=e197]: "#5"
                  - paragraph [ref=e198]: 25 of 57 all time · 44%
                  - generic [ref=e201]:
                    - generic "Draw" [ref=e202]: D
                    - generic "Loss" [ref=e203]: L
                    - generic "Loss" [ref=e204]: L
                    - generic "Draw" [ref=e205]: D
                    - generic "Draw" [ref=e206]: D
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: Elo
                  - generic [ref=e210]: "1298"
                - generic [ref=e211]:
                  - generic [ref=e212]: Skill
                  - generic [ref=e213]: Skill 3 of 5
              - generic [ref=e220]:
                - paragraph [ref=e221]: This season
                - generic [ref=e222]:
                  - generic [ref=e223]:
                    - generic [ref=e224]: "15"
                    - generic [ref=e225]: P
                  - generic [ref=e226]:
                    - generic [ref=e227]: "4"
                    - generic [ref=e228]: W
                  - generic [ref=e229]:
                    - generic [ref=e230]: "7"
                    - generic [ref=e231]: D
                  - generic [ref=e232]:
                    - generic [ref=e233]: "4"
                    - generic [ref=e234]: L
                  - generic [ref=e235]:
                    - generic [ref=e236]: "19"
                    - generic [ref=e237]: Pts
        - generic [ref=e238]:
          - generic [ref=e239]:
            - link "Edit Macca" [ref=e240]:
              - /url: /players/edit/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
            - button "Delete Macca" [ref=e244]
          - 'link "Macca #2 17 of 52 all time · 33% D W L D D Elo 1205 Skill Skill 4 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e248]':
            - /url: /players/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
            - generic [ref=e249]:
              - generic [ref=e250]:
                - generic [ref=e251]: M
                - generic [ref=e253]:
                  - generic [ref=e254]:
                    - heading "Macca" [level=3] [ref=e255]
                    - generic [ref=e256]: "#2"
                  - paragraph [ref=e257]: 17 of 52 all time · 33%
                  - generic [ref=e260]:
                    - generic "Draw" [ref=e261]: D
                    - generic "Win" [ref=e262]: W
                    - generic "Loss" [ref=e263]: L
                    - generic "Draw" [ref=e264]: D
                    - generic "Draw" [ref=e265]: D
              - generic [ref=e266]:
                - generic [ref=e267]:
                  - generic [ref=e268]: Elo
                  - generic [ref=e269]: "1205"
                - generic [ref=e270]:
                  - generic [ref=e271]: Skill
                  - generic [ref=e272]: Skill 4 of 5
              - generic [ref=e279]:
                - paragraph [ref=e280]: This season
                - generic [ref=e281]:
                  - generic [ref=e282]:
                    - generic [ref=e283]: "15"
                    - generic [ref=e284]: P
                  - generic [ref=e285]:
                    - generic [ref=e286]: "5"
                    - generic [ref=e287]: W
                  - generic [ref=e288]:
                    - generic [ref=e289]: "7"
                    - generic [ref=e290]: D
                  - generic [ref=e291]:
                    - generic [ref=e292]: "3"
                    - generic [ref=e293]: L
                  - generic [ref=e294]:
                    - generic [ref=e295]: "22"
                    - generic [ref=e296]: Pts
        - generic [ref=e297]:
          - generic [ref=e298]:
            - link "Edit Nobby" [ref=e299]:
              - /url: /players/edit/156f2997-9fbb-4ace-bae9-8112bd9d66e5
            - button "Delete Nobby" [ref=e303]
          - 'link "Nobby #5 19 of 57 all time · 33% D L W D D Elo 1160 Skill Skill 5 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e307]':
            - /url: /players/156f2997-9fbb-4ace-bae9-8112bd9d66e5
            - generic [ref=e308]:
              - generic [ref=e309]:
                - generic [ref=e310]: "N"
                - generic [ref=e312]:
                  - generic [ref=e313]:
                    - heading "Nobby" [level=3] [ref=e314]
                    - generic [ref=e315]: "#5"
                  - paragraph [ref=e316]: 19 of 57 all time · 33%
                  - generic [ref=e319]:
                    - generic "Draw" [ref=e320]: D
                    - generic "Loss" [ref=e321]: L
                    - generic "Win" [ref=e322]: W
                    - generic "Draw" [ref=e323]: D
                    - generic "Draw" [ref=e324]: D
              - generic [ref=e325]:
                - generic [ref=e326]:
                  - generic [ref=e327]: Elo
                  - generic [ref=e328]: "1160"
                - generic [ref=e329]:
                  - generic [ref=e330]: Skill
                  - generic [ref=e331]: Skill 5 of 5
              - generic [ref=e338]:
                - paragraph [ref=e339]: This season
                - generic [ref=e340]:
                  - generic [ref=e341]:
                    - generic [ref=e342]: "15"
                    - generic [ref=e343]: P
                  - generic [ref=e344]:
                    - generic [ref=e345]: "4"
                    - generic [ref=e346]: W
                  - generic [ref=e347]:
                    - generic [ref=e348]: "7"
                    - generic [ref=e349]: D
                  - generic [ref=e350]:
                    - generic [ref=e351]: "4"
                    - generic [ref=e352]: L
                  - generic [ref=e353]:
                    - generic [ref=e354]: "19"
                    - generic [ref=e355]: Pts
        - generic [ref=e356]:
          - generic [ref=e357]:
            - link "Edit Ollie" [ref=e358]:
              - /url: /players/edit/a8d72639-208d-4e2c-a566-47b7a6f72bb3
            - button "Delete Ollie" [ref=e362]
          - 'link "Ollie #2 23 of 57 all time · 40% D W W D D Elo 1282 Skill Skill 1 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e366]':
            - /url: /players/a8d72639-208d-4e2c-a566-47b7a6f72bb3
            - generic [ref=e367]:
              - generic [ref=e368]:
                - generic [ref=e369]: O
                - generic [ref=e371]:
                  - generic [ref=e372]:
                    - heading "Ollie" [level=3] [ref=e373]
                    - generic [ref=e374]: "#2"
                  - paragraph [ref=e375]: 23 of 57 all time · 40%
                  - generic [ref=e378]:
                    - generic "Draw" [ref=e379]: D
                    - generic "Win" [ref=e380]: W
                    - generic "Win" [ref=e381]: W
                    - generic "Draw" [ref=e382]: D
                    - generic "Draw" [ref=e383]: D
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - generic [ref=e386]: Elo
                  - generic [ref=e387]: "1282"
                - generic [ref=e388]:
                  - generic [ref=e389]: Skill
                  - generic [ref=e390]: Skill 1 of 5
              - generic [ref=e397]:
                - paragraph [ref=e398]: This season
                - generic [ref=e399]:
                  - generic [ref=e400]:
                    - generic [ref=e401]: "15"
                    - generic [ref=e402]: P
                  - generic [ref=e403]:
                    - generic [ref=e404]: "5"
                    - generic [ref=e405]: W
                  - generic [ref=e406]:
                    - generic [ref=e407]: "7"
                    - generic [ref=e408]: D
                  - generic [ref=e409]:
                    - generic [ref=e410]: "3"
                    - generic [ref=e411]: L
                  - generic [ref=e412]:
                    - generic [ref=e413]: "22"
                    - generic [ref=e414]: Pts
        - generic [ref=e415]:
          - generic [ref=e416]:
            - link "Edit Pikey" [ref=e417]:
              - /url: /players/edit/c9c0abe4-379f-4f8c-bd6c-18b921250905
            - button "Delete Pikey" [ref=e421]
          - 'link "Pikey #5 26 of 53 all time · 49% D W W D D Elo 1368 Skill Skill 2 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e425]':
            - /url: /players/c9c0abe4-379f-4f8c-bd6c-18b921250905
            - generic [ref=e426]:
              - generic [ref=e427]:
                - generic [ref=e428]: P
                - generic [ref=e430]:
                  - generic [ref=e431]:
                    - heading "Pikey" [level=3] [ref=e432]
                    - generic [ref=e433]: "#5"
                  - paragraph [ref=e434]: 26 of 53 all time · 49%
                  - generic [ref=e437]:
                    - generic "Draw" [ref=e438]: D
                    - generic "Win" [ref=e439]: W
                    - generic "Win" [ref=e440]: W
                    - generic "Draw" [ref=e441]: D
                    - generic "Draw" [ref=e442]: D
              - generic [ref=e443]:
                - generic [ref=e444]:
                  - generic [ref=e445]: Elo
                  - generic [ref=e446]: "1368"
                - generic [ref=e447]:
                  - generic [ref=e448]: Skill
                  - generic [ref=e449]: Skill 2 of 5
              - generic [ref=e456]:
                - paragraph [ref=e457]: This season
                - generic [ref=e458]:
                  - generic [ref=e459]:
                    - generic [ref=e460]: "15"
                    - generic [ref=e461]: P
                  - generic [ref=e462]:
                    - generic [ref=e463]: "4"
                    - generic [ref=e464]: W
                  - generic [ref=e465]:
                    - generic [ref=e466]: "7"
                    - generic [ref=e467]: D
                  - generic [ref=e468]:
                    - generic [ref=e469]: "4"
                    - generic [ref=e470]: L
                  - generic [ref=e471]:
                    - generic [ref=e472]: "19"
                    - generic [ref=e473]: Pts
        - generic [ref=e474]:
          - generic [ref=e475]:
            - link "Edit Ritchie" [ref=e476]:
              - /url: /players/edit/79e45b55-4e94-4e2f-b94a-912fae1eb57a
            - button "Delete Ritchie" [ref=e480]
          - 'link "Ritchie #8 8 of 54 all time · 15% D W L D D Elo 973 Skill Skill 3 of 5 This season 15 P 3 W 7 D 5 L 16 Pts" [ref=e484]':
            - /url: /players/79e45b55-4e94-4e2f-b94a-912fae1eb57a
            - generic [ref=e485]:
              - generic [ref=e486]:
                - generic [ref=e487]: R
                - generic [ref=e489]:
                  - generic [ref=e490]:
                    - heading "Ritchie" [level=3] [ref=e491]
                    - generic [ref=e492]: "#8"
                  - paragraph [ref=e493]: 8 of 54 all time · 15%
                  - generic [ref=e496]:
                    - generic "Draw" [ref=e497]: D
                    - generic "Win" [ref=e498]: W
                    - generic "Loss" [ref=e499]: L
                    - generic "Draw" [ref=e500]: D
                    - generic "Draw" [ref=e501]: D
              - generic [ref=e502]:
                - generic [ref=e503]:
                  - generic [ref=e504]: Elo
                  - generic [ref=e505]: "973"
                - generic [ref=e506]:
                  - generic [ref=e507]: Skill
                  - generic [ref=e508]: Skill 3 of 5
              - generic [ref=e515]:
                - paragraph [ref=e516]: This season
                - generic [ref=e517]:
                  - generic [ref=e518]:
                    - generic [ref=e519]: "15"
                    - generic [ref=e520]: P
                  - generic [ref=e521]:
                    - generic [ref=e522]: "3"
                    - generic [ref=e523]: W
                  - generic [ref=e524]:
                    - generic [ref=e525]: "7"
                    - generic [ref=e526]: D
                  - generic [ref=e527]:
                    - generic [ref=e528]: "5"
                    - generic [ref=e529]: L
                  - generic [ref=e530]:
                    - generic [ref=e531]: "16"
                    - generic [ref=e532]: Pts
        - generic [ref=e533]:
          - generic [ref=e534]:
            - link "Edit Scouse" [ref=e535]:
              - /url: /players/edit/01bd5ada-d818-4bf6-9847-87a800cd7c09
            - button "Delete Scouse" [ref=e539]
          - 'link "Scouse #1 21 of 55 all time · 38% D W L D D Elo 1218 Skill Skill 4 of 5 This season 15 P 6 W 7 D 2 L 25 Pts" [ref=e543]':
            - /url: /players/01bd5ada-d818-4bf6-9847-87a800cd7c09
            - generic [ref=e544]:
              - generic [ref=e545]:
                - generic [ref=e546]: S
                - generic [ref=e548]:
                  - generic [ref=e549]:
                    - heading "Scouse" [level=3] [ref=e550]
                    - generic [ref=e551]: "#1"
                  - paragraph [ref=e552]: 21 of 55 all time · 38%
                  - generic [ref=e555]:
                    - generic "Draw" [ref=e556]: D
                    - generic "Win" [ref=e557]: W
                    - generic "Loss" [ref=e558]: L
                    - generic "Draw" [ref=e559]: D
                    - generic "Draw" [ref=e560]: D
              - generic [ref=e561]:
                - generic [ref=e562]:
                  - generic [ref=e563]: Elo
                  - generic [ref=e564]: "1218"
                - generic [ref=e565]:
                  - generic [ref=e566]: Skill
                  - generic [ref=e567]: Skill 4 of 5
              - generic [ref=e574]:
                - paragraph [ref=e575]: This season
                - generic [ref=e576]:
                  - generic [ref=e577]:
                    - generic [ref=e578]: "15"
                    - generic [ref=e579]: P
                  - generic [ref=e580]:
                    - generic [ref=e581]: "6"
                    - generic [ref=e582]: W
                  - generic [ref=e583]:
                    - generic [ref=e584]: "7"
                    - generic [ref=e585]: D
                  - generic [ref=e586]:
                    - generic [ref=e587]: "2"
                    - generic [ref=e588]: L
                  - generic [ref=e589]:
                    - generic [ref=e590]: "25"
                    - generic [ref=e591]: Pts
        - generic [ref=e592]:
          - generic [ref=e593]:
            - link "Edit Tosh" [ref=e594]:
              - /url: /players/edit/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
            - button "Delete Tosh" [ref=e598]
          - 'link "Tosh #2 14 of 53 all time · 26% D L W D D Elo 1128 Skill Skill 5 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e602]':
            - /url: /players/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
            - generic [ref=e603]:
              - generic [ref=e604]:
                - generic [ref=e605]: T
                - generic [ref=e607]:
                  - generic [ref=e608]:
                    - heading "Tosh" [level=3] [ref=e609]
                    - generic [ref=e610]: "#2"
                  - paragraph [ref=e611]: 14 of 53 all time · 26%
                  - generic [ref=e614]:
                    - generic "Draw" [ref=e615]: D
                    - generic "Loss" [ref=e616]: L
                    - generic "Win" [ref=e617]: W
                    - generic "Draw" [ref=e618]: D
                    - generic "Draw" [ref=e619]: D
              - generic [ref=e620]:
                - generic [ref=e621]:
                  - generic [ref=e622]: Elo
                  - generic [ref=e623]: "1128"
                - generic [ref=e624]:
                  - generic [ref=e625]: Skill
                  - generic [ref=e626]: Skill 5 of 5
              - generic [ref=e633]:
                - paragraph [ref=e634]: This season
                - generic [ref=e635]:
                  - generic [ref=e636]:
                    - generic [ref=e637]: "15"
                    - generic [ref=e638]: P
                  - generic [ref=e639]:
                    - generic [ref=e640]: "5"
                    - generic [ref=e641]: W
                  - generic [ref=e642]:
                    - generic [ref=e643]: "7"
                    - generic [ref=e644]: D
                  - generic [ref=e645]:
                    - generic [ref=e646]: "3"
                    - generic [ref=e647]: L
                  - generic [ref=e648]:
                    - generic [ref=e649]: "22"
                    - generic [ref=e650]: Pts
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e656] [cursor=pointer]
  - alert [ref=e662]
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