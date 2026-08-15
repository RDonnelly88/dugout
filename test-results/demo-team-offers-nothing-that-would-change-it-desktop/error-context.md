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
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByRole('link', { name: /add player/i })
    14 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - button "Thursday Nighters" [ref=e6]
          - button [ref=e9]
        - button "Collapse sidebar" [ref=e10]
      - generic [ref=e14]:
        - link "Home" [ref=e15] [cursor=pointer]:
          - /url: /
        - link "Players" [ref=e20] [cursor=pointer]:
          - /url: /players
        - link "Matches" [ref=e27] [cursor=pointer]:
          - /url: /matches
        - link "Seasons" [ref=e31] [cursor=pointer]:
          - /url: /seasons
        - link "Ratings" [ref=e39] [cursor=pointer]:
          - /url: /ratings
        - link "Compare" [ref=e44] [cursor=pointer]:
          - /url: /compare
        - link "Team" [ref=e49] [cursor=pointer]:
          - /url: /team
        - link "Settings" [ref=e63] [cursor=pointer]:
          - /url: /settings
        - heading "Actions" [level=3] [ref=e70]
        - link "Add Player" [ref=e71] [cursor=pointer]:
          - /url: /players/add
        - link "Create Match" [ref=e74] [cursor=pointer]:
          - /url: /matches/create
        - link "Create Season" [ref=e77] [cursor=pointer]:
          - /url: /seasons/create
    - main [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e84]:
          - heading "Players" [level=1] [ref=e86]
          - paragraph [ref=e87]: The squad, their records and their form
        - generic [ref=e88]:
          - generic [ref=e89]:
            - heading "Summer 2026" [level=3] [ref=e90]
            - paragraph [ref=e98]: Current season · 23/04/2026 – ongoing
          - generic [ref=e100]:
            - generic [ref=e101]: 10 have featured
            - link "View the league table" [ref=e104] [cursor=pointer]:
              - /url: /seasons/25c7ade6-ca02-45e6-8d88-b63d83e54b88
        - generic [ref=e105]:
          - generic [ref=e106]:
            - textbox "Search players..." [ref=e111]
            - group "Which players to show" [ref=e112]:
              - button "Active 10" [pressed] [ref=e114]:
                - text: Active
                - generic [ref=e119]: "10"
              - button "Everyone 12" [ref=e120]:
                - text: Everyone
                - generic [ref=e126]: "12"
          - link "Add player" [ref=e127] [cursor=pointer]:
            - /url: /players/add
        - generic [ref=e128]:
          - generic [ref=e129]:
            - generic [ref=e130]:
              - link "Edit Baz" [ref=e131] [cursor=pointer]:
                - /url: /players/edit/6d372593-e530-4405-931c-5bfcbae92abc
              - button "Delete Baz" [ref=e135]
            - 'link "Baz #8 12 of 54 all time · 22% D L L D D Elo 1053 Skill Skill 1 of 5 This season 15 P 3 W 7 D 5 L 16 Pts" [ref=e139] [cursor=pointer]':
              - /url: /players/6d372593-e530-4405-931c-5bfcbae92abc
              - generic [ref=e140]:
                - generic [ref=e141]:
                  - generic [ref=e142]: B
                  - generic [ref=e144]:
                    - generic [ref=e145]:
                      - heading "Baz" [level=3] [ref=e146]
                      - generic [ref=e147]: "#8"
                    - paragraph [ref=e148]: 12 of 54 all time · 22%
                    - generic [ref=e151]:
                      - generic "Draw" [ref=e152]: D
                      - generic "Loss" [ref=e153]: L
                      - generic "Loss" [ref=e154]: L
                      - generic "Draw" [ref=e155]: D
                      - generic "Draw" [ref=e156]: D
                - generic [ref=e157]:
                  - generic [ref=e158]:
                    - generic [ref=e159]: Elo
                    - generic [ref=e160]: "1053"
                  - generic [ref=e161]:
                    - generic [ref=e162]: Skill
                    - generic [ref=e163]: Skill 1 of 5
                - generic [ref=e170]:
                  - paragraph [ref=e171]: This season
                  - generic [ref=e172]:
                    - generic [ref=e173]:
                      - generic [ref=e174]: "15"
                      - generic [ref=e175]: P
                    - generic [ref=e176]:
                      - generic [ref=e177]: "3"
                      - generic [ref=e178]: W
                    - generic [ref=e179]:
                      - generic [ref=e180]: "7"
                      - generic [ref=e181]: D
                    - generic [ref=e182]:
                      - generic [ref=e183]: "5"
                      - generic [ref=e184]: L
                    - generic [ref=e185]:
                      - generic [ref=e186]: "16"
                      - generic [ref=e187]: Pts
          - generic [ref=e188]:
            - generic [ref=e189]:
              - link "Edit Deano" [ref=e190] [cursor=pointer]:
                - /url: /players/edit/144b7561-7954-4647-b81e-c14f90147b33
              - button "Delete Deano" [ref=e194]
            - 'link "Deano #10 16 of 52 all time · 31% D L W D D Elo 1164 Skill Skill 2 of 5 This season 15 P 1 W 7 D 7 L 10 Pts" [ref=e198] [cursor=pointer]':
              - /url: /players/144b7561-7954-4647-b81e-c14f90147b33
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - generic [ref=e201]: D
                  - generic [ref=e203]:
                    - generic [ref=e204]:
                      - heading "Deano" [level=3] [ref=e205]
                      - generic [ref=e206]: "#10"
                    - paragraph [ref=e207]: 16 of 52 all time · 31%
                    - generic [ref=e210]:
                      - generic "Draw" [ref=e211]: D
                      - generic "Loss" [ref=e212]: L
                      - generic "Win" [ref=e213]: W
                      - generic "Draw" [ref=e214]: D
                      - generic "Draw" [ref=e215]: D
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - generic [ref=e218]: Elo
                    - generic [ref=e219]: "1164"
                  - generic [ref=e220]:
                    - generic [ref=e221]: Skill
                    - generic [ref=e222]: Skill 2 of 5
                - generic [ref=e229]:
                  - paragraph [ref=e230]: This season
                  - generic [ref=e231]:
                    - generic [ref=e232]:
                      - generic [ref=e233]: "15"
                      - generic [ref=e234]: P
                    - generic [ref=e235]:
                      - generic [ref=e236]: "1"
                      - generic [ref=e237]: W
                    - generic [ref=e238]:
                      - generic [ref=e239]: "7"
                      - generic [ref=e240]: D
                    - generic [ref=e241]:
                      - generic [ref=e242]: "7"
                      - generic [ref=e243]: L
                    - generic [ref=e244]:
                      - generic [ref=e245]: "10"
                      - generic [ref=e246]: Pts
          - generic [ref=e247]:
            - generic [ref=e248]:
              - link "Edit Keeper" [ref=e249] [cursor=pointer]:
                - /url: /players/edit/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
              - button "Delete Keeper" [ref=e253]
            - 'link "Keeper #5 25 of 57 all time · 44% D L L D D Elo 1298 Skill Skill 3 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e257] [cursor=pointer]':
              - /url: /players/52bc43e7-1c8e-4aee-bd0a-ced4bcf53fe1
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - generic [ref=e260]: K
                  - generic [ref=e262]:
                    - generic [ref=e263]:
                      - heading "Keeper" [level=3] [ref=e264]
                      - generic [ref=e265]: "#5"
                    - paragraph [ref=e266]: 25 of 57 all time · 44%
                    - generic [ref=e269]:
                      - generic "Draw" [ref=e270]: D
                      - generic "Loss" [ref=e271]: L
                      - generic "Loss" [ref=e272]: L
                      - generic "Draw" [ref=e273]: D
                      - generic "Draw" [ref=e274]: D
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - generic [ref=e277]: Elo
                    - generic [ref=e278]: "1298"
                  - generic [ref=e279]:
                    - generic [ref=e280]: Skill
                    - generic [ref=e281]: Skill 3 of 5
                - generic [ref=e288]:
                  - paragraph [ref=e289]: This season
                  - generic [ref=e290]:
                    - generic [ref=e291]:
                      - generic [ref=e292]: "15"
                      - generic [ref=e293]: P
                    - generic [ref=e294]:
                      - generic [ref=e295]: "4"
                      - generic [ref=e296]: W
                    - generic [ref=e297]:
                      - generic [ref=e298]: "7"
                      - generic [ref=e299]: D
                    - generic [ref=e300]:
                      - generic [ref=e301]: "4"
                      - generic [ref=e302]: L
                    - generic [ref=e303]:
                      - generic [ref=e304]: "19"
                      - generic [ref=e305]: Pts
          - generic [ref=e306]:
            - generic [ref=e307]:
              - link "Edit Macca" [ref=e308] [cursor=pointer]:
                - /url: /players/edit/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
              - button "Delete Macca" [ref=e312]
            - 'link "Macca #2 17 of 52 all time · 33% D W L D D Elo 1205 Skill Skill 4 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e316] [cursor=pointer]':
              - /url: /players/0e4ee9b2-51c6-4c50-830d-082cb9b24aaa
              - generic [ref=e317]:
                - generic [ref=e318]:
                  - generic [ref=e319]: M
                  - generic [ref=e321]:
                    - generic [ref=e322]:
                      - heading "Macca" [level=3] [ref=e323]
                      - generic [ref=e324]: "#2"
                    - paragraph [ref=e325]: 17 of 52 all time · 33%
                    - generic [ref=e328]:
                      - generic "Draw" [ref=e329]: D
                      - generic "Win" [ref=e330]: W
                      - generic "Loss" [ref=e331]: L
                      - generic "Draw" [ref=e332]: D
                      - generic "Draw" [ref=e333]: D
                - generic [ref=e334]:
                  - generic [ref=e335]:
                    - generic [ref=e336]: Elo
                    - generic [ref=e337]: "1205"
                  - generic [ref=e338]:
                    - generic [ref=e339]: Skill
                    - generic [ref=e340]: Skill 4 of 5
                - generic [ref=e347]:
                  - paragraph [ref=e348]: This season
                  - generic [ref=e349]:
                    - generic [ref=e350]:
                      - generic [ref=e351]: "15"
                      - generic [ref=e352]: P
                    - generic [ref=e353]:
                      - generic [ref=e354]: "5"
                      - generic [ref=e355]: W
                    - generic [ref=e356]:
                      - generic [ref=e357]: "7"
                      - generic [ref=e358]: D
                    - generic [ref=e359]:
                      - generic [ref=e360]: "3"
                      - generic [ref=e361]: L
                    - generic [ref=e362]:
                      - generic [ref=e363]: "22"
                      - generic [ref=e364]: Pts
          - generic [ref=e365]:
            - generic [ref=e366]:
              - link "Edit Nobby" [ref=e367] [cursor=pointer]:
                - /url: /players/edit/156f2997-9fbb-4ace-bae9-8112bd9d66e5
              - button "Delete Nobby" [ref=e371]
            - 'link "Nobby #5 19 of 57 all time · 33% D L W D D Elo 1160 Skill Skill 5 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e375] [cursor=pointer]':
              - /url: /players/156f2997-9fbb-4ace-bae9-8112bd9d66e5
              - generic [ref=e376]:
                - generic [ref=e377]:
                  - generic [ref=e378]: "N"
                  - generic [ref=e380]:
                    - generic [ref=e381]:
                      - heading "Nobby" [level=3] [ref=e382]
                      - generic [ref=e383]: "#5"
                    - paragraph [ref=e384]: 19 of 57 all time · 33%
                    - generic [ref=e387]:
                      - generic "Draw" [ref=e388]: D
                      - generic "Loss" [ref=e389]: L
                      - generic "Win" [ref=e390]: W
                      - generic "Draw" [ref=e391]: D
                      - generic "Draw" [ref=e392]: D
                - generic [ref=e393]:
                  - generic [ref=e394]:
                    - generic [ref=e395]: Elo
                    - generic [ref=e396]: "1160"
                  - generic [ref=e397]:
                    - generic [ref=e398]: Skill
                    - generic [ref=e399]: Skill 5 of 5
                - generic [ref=e406]:
                  - paragraph [ref=e407]: This season
                  - generic [ref=e408]:
                    - generic [ref=e409]:
                      - generic [ref=e410]: "15"
                      - generic [ref=e411]: P
                    - generic [ref=e412]:
                      - generic [ref=e413]: "4"
                      - generic [ref=e414]: W
                    - generic [ref=e415]:
                      - generic [ref=e416]: "7"
                      - generic [ref=e417]: D
                    - generic [ref=e418]:
                      - generic [ref=e419]: "4"
                      - generic [ref=e420]: L
                    - generic [ref=e421]:
                      - generic [ref=e422]: "19"
                      - generic [ref=e423]: Pts
          - generic [ref=e424]:
            - generic [ref=e425]:
              - link "Edit Ollie" [ref=e426] [cursor=pointer]:
                - /url: /players/edit/a8d72639-208d-4e2c-a566-47b7a6f72bb3
              - button "Delete Ollie" [ref=e430]
            - 'link "Ollie #2 23 of 57 all time · 40% D W W D D Elo 1282 Skill Skill 1 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e434] [cursor=pointer]':
              - /url: /players/a8d72639-208d-4e2c-a566-47b7a6f72bb3
              - generic [ref=e435]:
                - generic [ref=e436]:
                  - generic [ref=e437]: O
                  - generic [ref=e439]:
                    - generic [ref=e440]:
                      - heading "Ollie" [level=3] [ref=e441]
                      - generic [ref=e442]: "#2"
                    - paragraph [ref=e443]: 23 of 57 all time · 40%
                    - generic [ref=e446]:
                      - generic "Draw" [ref=e447]: D
                      - generic "Win" [ref=e448]: W
                      - generic "Win" [ref=e449]: W
                      - generic "Draw" [ref=e450]: D
                      - generic "Draw" [ref=e451]: D
                - generic [ref=e452]:
                  - generic [ref=e453]:
                    - generic [ref=e454]: Elo
                    - generic [ref=e455]: "1282"
                  - generic [ref=e456]:
                    - generic [ref=e457]: Skill
                    - generic [ref=e458]: Skill 1 of 5
                - generic [ref=e465]:
                  - paragraph [ref=e466]: This season
                  - generic [ref=e467]:
                    - generic [ref=e468]:
                      - generic [ref=e469]: "15"
                      - generic [ref=e470]: P
                    - generic [ref=e471]:
                      - generic [ref=e472]: "5"
                      - generic [ref=e473]: W
                    - generic [ref=e474]:
                      - generic [ref=e475]: "7"
                      - generic [ref=e476]: D
                    - generic [ref=e477]:
                      - generic [ref=e478]: "3"
                      - generic [ref=e479]: L
                    - generic [ref=e480]:
                      - generic [ref=e481]: "22"
                      - generic [ref=e482]: Pts
          - generic [ref=e483]:
            - generic [ref=e484]:
              - link "Edit Pikey" [ref=e485] [cursor=pointer]:
                - /url: /players/edit/c9c0abe4-379f-4f8c-bd6c-18b921250905
              - button "Delete Pikey" [ref=e489]
            - 'link "Pikey #5 26 of 53 all time · 49% D W W D D Elo 1368 Skill Skill 2 of 5 This season 15 P 4 W 7 D 4 L 19 Pts" [ref=e493] [cursor=pointer]':
              - /url: /players/c9c0abe4-379f-4f8c-bd6c-18b921250905
              - generic [ref=e494]:
                - generic [ref=e495]:
                  - generic [ref=e496]: P
                  - generic [ref=e498]:
                    - generic [ref=e499]:
                      - heading "Pikey" [level=3] [ref=e500]
                      - generic [ref=e501]: "#5"
                    - paragraph [ref=e502]: 26 of 53 all time · 49%
                    - generic [ref=e505]:
                      - generic "Draw" [ref=e506]: D
                      - generic "Win" [ref=e507]: W
                      - generic "Win" [ref=e508]: W
                      - generic "Draw" [ref=e509]: D
                      - generic "Draw" [ref=e510]: D
                - generic [ref=e511]:
                  - generic [ref=e512]:
                    - generic [ref=e513]: Elo
                    - generic [ref=e514]: "1368"
                  - generic [ref=e515]:
                    - generic [ref=e516]: Skill
                    - generic [ref=e517]: Skill 2 of 5
                - generic [ref=e524]:
                  - paragraph [ref=e525]: This season
                  - generic [ref=e526]:
                    - generic [ref=e527]:
                      - generic [ref=e528]: "15"
                      - generic [ref=e529]: P
                    - generic [ref=e530]:
                      - generic [ref=e531]: "4"
                      - generic [ref=e532]: W
                    - generic [ref=e533]:
                      - generic [ref=e534]: "7"
                      - generic [ref=e535]: D
                    - generic [ref=e536]:
                      - generic [ref=e537]: "4"
                      - generic [ref=e538]: L
                    - generic [ref=e539]:
                      - generic [ref=e540]: "19"
                      - generic [ref=e541]: Pts
          - generic [ref=e542]:
            - generic [ref=e543]:
              - link "Edit Ritchie" [ref=e544] [cursor=pointer]:
                - /url: /players/edit/79e45b55-4e94-4e2f-b94a-912fae1eb57a
              - button "Delete Ritchie" [ref=e548]
            - 'link "Ritchie #8 8 of 54 all time · 15% D W L D D Elo 973 Skill Skill 3 of 5 This season 15 P 3 W 7 D 5 L 16 Pts" [ref=e552] [cursor=pointer]':
              - /url: /players/79e45b55-4e94-4e2f-b94a-912fae1eb57a
              - generic [ref=e553]:
                - generic [ref=e554]:
                  - generic [ref=e555]: R
                  - generic [ref=e557]:
                    - generic [ref=e558]:
                      - heading "Ritchie" [level=3] [ref=e559]
                      - generic [ref=e560]: "#8"
                    - paragraph [ref=e561]: 8 of 54 all time · 15%
                    - generic [ref=e564]:
                      - generic "Draw" [ref=e565]: D
                      - generic "Win" [ref=e566]: W
                      - generic "Loss" [ref=e567]: L
                      - generic "Draw" [ref=e568]: D
                      - generic "Draw" [ref=e569]: D
                - generic [ref=e570]:
                  - generic [ref=e571]:
                    - generic [ref=e572]: Elo
                    - generic [ref=e573]: "973"
                  - generic [ref=e574]:
                    - generic [ref=e575]: Skill
                    - generic [ref=e576]: Skill 3 of 5
                - generic [ref=e583]:
                  - paragraph [ref=e584]: This season
                  - generic [ref=e585]:
                    - generic [ref=e586]:
                      - generic [ref=e587]: "15"
                      - generic [ref=e588]: P
                    - generic [ref=e589]:
                      - generic [ref=e590]: "3"
                      - generic [ref=e591]: W
                    - generic [ref=e592]:
                      - generic [ref=e593]: "7"
                      - generic [ref=e594]: D
                    - generic [ref=e595]:
                      - generic [ref=e596]: "5"
                      - generic [ref=e597]: L
                    - generic [ref=e598]:
                      - generic [ref=e599]: "16"
                      - generic [ref=e600]: Pts
          - generic [ref=e601]:
            - generic [ref=e602]:
              - link "Edit Scouse" [ref=e603] [cursor=pointer]:
                - /url: /players/edit/01bd5ada-d818-4bf6-9847-87a800cd7c09
              - button "Delete Scouse" [ref=e607]
            - 'link "Scouse #1 21 of 55 all time · 38% D W L D D Elo 1218 Skill Skill 4 of 5 This season 15 P 6 W 7 D 2 L 25 Pts" [ref=e611] [cursor=pointer]':
              - /url: /players/01bd5ada-d818-4bf6-9847-87a800cd7c09
              - generic [ref=e612]:
                - generic [ref=e613]:
                  - generic [ref=e614]: S
                  - generic [ref=e616]:
                    - generic [ref=e617]:
                      - heading "Scouse" [level=3] [ref=e618]
                      - generic [ref=e619]: "#1"
                    - paragraph [ref=e620]: 21 of 55 all time · 38%
                    - generic [ref=e623]:
                      - generic "Draw" [ref=e624]: D
                      - generic "Win" [ref=e625]: W
                      - generic "Loss" [ref=e626]: L
                      - generic "Draw" [ref=e627]: D
                      - generic "Draw" [ref=e628]: D
                - generic [ref=e629]:
                  - generic [ref=e630]:
                    - generic [ref=e631]: Elo
                    - generic [ref=e632]: "1218"
                  - generic [ref=e633]:
                    - generic [ref=e634]: Skill
                    - generic [ref=e635]: Skill 4 of 5
                - generic [ref=e642]:
                  - paragraph [ref=e643]: This season
                  - generic [ref=e644]:
                    - generic [ref=e645]:
                      - generic [ref=e646]: "15"
                      - generic [ref=e647]: P
                    - generic [ref=e648]:
                      - generic [ref=e649]: "6"
                      - generic [ref=e650]: W
                    - generic [ref=e651]:
                      - generic [ref=e652]: "7"
                      - generic [ref=e653]: D
                    - generic [ref=e654]:
                      - generic [ref=e655]: "2"
                      - generic [ref=e656]: L
                    - generic [ref=e657]:
                      - generic [ref=e658]: "25"
                      - generic [ref=e659]: Pts
          - generic [ref=e660]:
            - generic [ref=e661]:
              - link "Edit Tosh" [ref=e662] [cursor=pointer]:
                - /url: /players/edit/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
              - button "Delete Tosh" [ref=e666]
            - 'link "Tosh #2 14 of 53 all time · 26% D L W D D Elo 1128 Skill Skill 5 of 5 This season 15 P 5 W 7 D 3 L 22 Pts" [ref=e670] [cursor=pointer]':
              - /url: /players/a054dabe-7a0a-4991-9ee6-9a72d41d99aa
              - generic [ref=e671]:
                - generic [ref=e672]:
                  - generic [ref=e673]: T
                  - generic [ref=e675]:
                    - generic [ref=e676]:
                      - heading "Tosh" [level=3] [ref=e677]
                      - generic [ref=e678]: "#2"
                    - paragraph [ref=e679]: 14 of 53 all time · 26%
                    - generic [ref=e682]:
                      - generic "Draw" [ref=e683]: D
                      - generic "Loss" [ref=e684]: L
                      - generic "Win" [ref=e685]: W
                      - generic "Draw" [ref=e686]: D
                      - generic "Draw" [ref=e687]: D
                - generic [ref=e688]:
                  - generic [ref=e689]:
                    - generic [ref=e690]: Elo
                    - generic [ref=e691]: "1128"
                  - generic [ref=e692]:
                    - generic [ref=e693]: Skill
                    - generic [ref=e694]: Skill 5 of 5
                - generic [ref=e701]:
                  - paragraph [ref=e702]: This season
                  - generic [ref=e703]:
                    - generic [ref=e704]:
                      - generic [ref=e705]: "15"
                      - generic [ref=e706]: P
                    - generic [ref=e707]:
                      - generic [ref=e708]: "5"
                      - generic [ref=e709]: W
                    - generic [ref=e710]:
                      - generic [ref=e711]: "7"
                      - generic [ref=e712]: D
                    - generic [ref=e713]:
                      - generic [ref=e714]: "3"
                      - generic [ref=e715]: L
                    - generic [ref=e716]:
                      - generic [ref=e717]: "22"
                      - generic [ref=e718]: Pts
  - region "Notifications (F8)":
    - list
  - generic [ref=e723] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e724]
    - generic [ref=e728]:
      - button "Open issues overlay" [ref=e729]:
        - generic [ref=e730]:
          - generic [ref=e731]: "0"
          - generic [ref=e732]: "1"
        - generic [ref=e733]: Issue
      - button "Collapse issues badge" [ref=e734]
  - alert [ref=e737]
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