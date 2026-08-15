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
            - generic [ref=e101]: 12 have featured
            - link "View the league table" [ref=e104] [cursor=pointer]:
              - /url: /seasons/5b91a6b6-5a6e-4f6b-af95-59ec795ff9f0
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
                - /url: /players/edit/374e83eb-e755-412b-9091-2484fcaec94c
              - button "Delete Baz" [ref=e135]
            - 'link "Baz #9 11 of 48 all time · 23% L W W D Elo 1107 Skill Skill 1 of 5 This season 10 P 3 W 5 D 2 L 14 Pts" [ref=e139] [cursor=pointer]':
              - /url: /players/374e83eb-e755-412b-9091-2484fcaec94c
              - generic [ref=e140]:
                - generic [ref=e141]:
                  - generic [ref=e142]: B
                  - generic [ref=e144]:
                    - generic [ref=e145]:
                      - heading "Baz" [level=3] [ref=e146]
                      - generic [ref=e147]: "#9"
                    - paragraph [ref=e148]: 11 of 48 all time · 23%
                    - generic [ref=e151]:
                      - generic "Did Not Play" [ref=e152]
                      - generic "Loss" [ref=e158]: L
                      - generic "Win" [ref=e159]: W
                      - generic "Win" [ref=e160]: W
                      - generic "Draw" [ref=e161]: D
                - generic [ref=e162]:
                  - generic [ref=e163]:
                    - generic [ref=e164]: Elo
                    - generic [ref=e165]: "1107"
                  - generic [ref=e166]:
                    - generic [ref=e167]: Skill
                    - generic [ref=e168]: Skill 1 of 5
                - generic [ref=e175]:
                  - paragraph [ref=e176]: This season
                  - generic [ref=e177]:
                    - generic [ref=e178]:
                      - generic [ref=e179]: "10"
                      - generic [ref=e180]: P
                    - generic [ref=e181]:
                      - generic [ref=e182]: "3"
                      - generic [ref=e183]: W
                    - generic [ref=e184]:
                      - generic [ref=e185]: "5"
                      - generic [ref=e186]: D
                    - generic [ref=e187]:
                      - generic [ref=e188]: "2"
                      - generic [ref=e189]: L
                    - generic [ref=e190]:
                      - generic [ref=e191]: "14"
                      - generic [ref=e192]: Pts
          - generic [ref=e193]:
            - generic [ref=e194]:
              - link "Edit Deano" [ref=e195] [cursor=pointer]:
                - /url: /players/edit/b97dba2e-a8b2-4245-82d9-38768c5ce35a
              - button "Delete Deano" [ref=e199]
            - 'link "Deano #11 14 of 50 all time · 28% L L L L Elo 1182 Skill Skill 2 of 5 This season 14 P 2 W 5 D 7 L 11 Pts" [ref=e203] [cursor=pointer]':
              - /url: /players/b97dba2e-a8b2-4245-82d9-38768c5ce35a
              - generic [ref=e204]:
                - generic [ref=e205]:
                  - generic [ref=e206]: D
                  - generic [ref=e208]:
                    - generic [ref=e209]:
                      - heading "Deano" [level=3] [ref=e210]
                      - generic [ref=e211]: "#11"
                    - paragraph [ref=e212]: 14 of 50 all time · 28%
                    - generic [ref=e215]:
                      - generic "Loss" [ref=e216]: L
                      - generic "Loss" [ref=e217]: L
                      - generic "Loss" [ref=e218]: L
                      - generic "Loss" [ref=e219]: L
                      - generic "Did Not Play" [ref=e220]
                - generic [ref=e226]:
                  - generic [ref=e227]:
                    - generic [ref=e228]: Elo
                    - generic [ref=e229]: "1182"
                  - generic [ref=e230]:
                    - generic [ref=e231]: Skill
                    - generic [ref=e232]: Skill 2 of 5
                - generic [ref=e239]:
                  - paragraph [ref=e240]: This season
                  - generic [ref=e241]:
                    - generic [ref=e242]:
                      - generic [ref=e243]: "14"
                      - generic [ref=e244]: P
                    - generic [ref=e245]:
                      - generic [ref=e246]: "2"
                      - generic [ref=e247]: W
                    - generic [ref=e248]:
                      - generic [ref=e249]: "5"
                      - generic [ref=e250]: D
                    - generic [ref=e251]:
                      - generic [ref=e252]: "7"
                      - generic [ref=e253]: L
                    - generic [ref=e254]:
                      - generic [ref=e255]: "11"
                      - generic [ref=e256]: Pts
          - generic [ref=e257]:
            - generic [ref=e258]:
              - link "Edit Keeper" [ref=e259] [cursor=pointer]:
                - /url: /players/edit/9a3f246c-c0c6-414e-9a16-3f260f88192a
              - button "Delete Keeper" [ref=e263]
            - 'link "Keeper #1 22 of 52 all time · 42% W W W L D Elo 1287 Skill Skill 3 of 5 This season 14 P 6 W 5 D 3 L 23 Pts" [ref=e267] [cursor=pointer]':
              - /url: /players/9a3f246c-c0c6-414e-9a16-3f260f88192a
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - generic [ref=e270]: K
                  - generic [ref=e272]:
                    - generic [ref=e273]:
                      - heading "Keeper" [level=3] [ref=e274]
                      - generic [ref=e275]: "#1"
                    - paragraph [ref=e276]: 22 of 52 all time · 42%
                    - generic [ref=e279]:
                      - generic "Win" [ref=e280]: W
                      - generic "Win" [ref=e281]: W
                      - generic "Win" [ref=e282]: W
                      - generic "Loss" [ref=e283]: L
                      - generic "Draw" [ref=e284]: D
                - generic [ref=e285]:
                  - generic [ref=e286]:
                    - generic [ref=e287]: Elo
                    - generic [ref=e288]: "1287"
                  - generic [ref=e289]:
                    - generic [ref=e290]: Skill
                    - generic [ref=e291]: Skill 3 of 5
                - generic [ref=e298]:
                  - paragraph [ref=e299]: This season
                  - generic [ref=e300]:
                    - generic [ref=e301]:
                      - generic [ref=e302]: "14"
                      - generic [ref=e303]: P
                    - generic [ref=e304]:
                      - generic [ref=e305]: "6"
                      - generic [ref=e306]: W
                    - generic [ref=e307]:
                      - generic [ref=e308]: "5"
                      - generic [ref=e309]: D
                    - generic [ref=e310]:
                      - generic [ref=e311]: "3"
                      - generic [ref=e312]: L
                    - generic [ref=e313]:
                      - generic [ref=e314]: "23"
                      - generic [ref=e315]: Pts
          - generic [ref=e316]:
            - generic [ref=e317]:
              - link "Edit Macca" [ref=e318] [cursor=pointer]:
                - /url: /players/edit/a7d08d89-695c-45af-8142-e5a4c01887e0
              - button "Delete Macca" [ref=e322]
            - 'link "Macca #8 13 of 49 all time · 27% L W L D Elo 1142 Skill Skill 4 of 5 This season 14 P 3 W 6 D 5 L 15 Pts" [ref=e326] [cursor=pointer]':
              - /url: /players/a7d08d89-695c-45af-8142-e5a4c01887e0
              - generic [ref=e327]:
                - generic [ref=e328]:
                  - generic [ref=e329]: M
                  - generic [ref=e331]:
                    - generic [ref=e332]:
                      - heading "Macca" [level=3] [ref=e333]
                      - generic [ref=e334]: "#8"
                    - paragraph [ref=e335]: 13 of 49 all time · 27%
                    - generic [ref=e338]:
                      - generic "Loss" [ref=e339]: L
                      - generic "Did Not Play" [ref=e340]
                      - generic "Win" [ref=e346]: W
                      - generic "Loss" [ref=e347]: L
                      - generic "Draw" [ref=e348]: D
                - generic [ref=e349]:
                  - generic [ref=e350]:
                    - generic [ref=e351]: Elo
                    - generic [ref=e352]: "1142"
                  - generic [ref=e353]:
                    - generic [ref=e354]: Skill
                    - generic [ref=e355]: Skill 4 of 5
                - generic [ref=e362]:
                  - paragraph [ref=e363]: This season
                  - generic [ref=e364]:
                    - generic [ref=e365]:
                      - generic [ref=e366]: "14"
                      - generic [ref=e367]: P
                    - generic [ref=e368]:
                      - generic [ref=e369]: "3"
                      - generic [ref=e370]: W
                    - generic [ref=e371]:
                      - generic [ref=e372]: "6"
                      - generic [ref=e373]: D
                    - generic [ref=e374]:
                      - generic [ref=e375]: "5"
                      - generic [ref=e376]: L
                    - generic [ref=e377]:
                      - generic [ref=e378]: "15"
                      - generic [ref=e379]: Pts
          - generic [ref=e380]:
            - generic [ref=e381]:
              - link "Edit Nobby" [ref=e382] [cursor=pointer]:
                - /url: /players/edit/3bf995fb-4c06-47a9-a01e-fd5a946280e5
              - button "Delete Nobby" [ref=e386]
            - 'link "Nobby #5 15 of 55 all time · 27% W L W L D Elo 1121 Skill Skill 5 of 5 This season 14 P 4 W 5 D 5 L 17 Pts" [ref=e390] [cursor=pointer]':
              - /url: /players/3bf995fb-4c06-47a9-a01e-fd5a946280e5
              - generic [ref=e391]:
                - generic [ref=e392]:
                  - generic [ref=e393]: "N"
                  - generic [ref=e395]:
                    - generic [ref=e396]:
                      - heading "Nobby" [level=3] [ref=e397]
                      - generic [ref=e398]: "#5"
                    - paragraph [ref=e399]: 15 of 55 all time · 27%
                    - generic [ref=e402]:
                      - generic "Win" [ref=e403]: W
                      - generic "Loss" [ref=e404]: L
                      - generic "Win" [ref=e405]: W
                      - generic "Loss" [ref=e406]: L
                      - generic "Draw" [ref=e407]: D
                - generic [ref=e408]:
                  - generic [ref=e409]:
                    - generic [ref=e410]: Elo
                    - generic [ref=e411]: "1121"
                  - generic [ref=e412]:
                    - generic [ref=e413]: Skill
                    - generic [ref=e414]: Skill 5 of 5
                - generic [ref=e421]:
                  - paragraph [ref=e422]: This season
                  - generic [ref=e423]:
                    - generic [ref=e424]:
                      - generic [ref=e425]: "14"
                      - generic [ref=e426]: P
                    - generic [ref=e427]:
                      - generic [ref=e428]: "4"
                      - generic [ref=e429]: W
                    - generic [ref=e430]:
                      - generic [ref=e431]: "5"
                      - generic [ref=e432]: D
                    - generic [ref=e433]:
                      - generic [ref=e434]: "5"
                      - generic [ref=e435]: L
                    - generic [ref=e436]:
                      - generic [ref=e437]: "17"
                      - generic [ref=e438]: Pts
          - generic [ref=e439]:
            - generic [ref=e440]:
              - link "Edit Ollie" [ref=e441] [cursor=pointer]:
                - /url: /players/edit/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
              - button "Delete Ollie" [ref=e445]
            - 'link "Ollie #10 18 of 48 all time · 38% W L D Elo 1280 Skill Skill 1 of 5 This season 10 P 3 W 4 D 3 L 13 Pts" [ref=e449] [cursor=pointer]':
              - /url: /players/a7eb11de-6cdf-4fc9-b5f0-fc6483689df6
              - generic [ref=e450]:
                - generic [ref=e451]:
                  - generic [ref=e452]: O
                  - generic [ref=e454]:
                    - generic [ref=e455]:
                      - heading "Ollie" [level=3] [ref=e456]
                      - generic [ref=e457]: "#10"
                    - paragraph [ref=e458]: 18 of 48 all time · 38%
                    - generic [ref=e461]:
                      - generic "Did Not Play" [ref=e462]
                      - generic "Win" [ref=e468]: W
                      - generic "Loss" [ref=e469]: L
                      - generic "Did Not Play" [ref=e470]
                      - generic "Draw" [ref=e476]: D
                - generic [ref=e477]:
                  - generic [ref=e478]:
                    - generic [ref=e479]: Elo
                    - generic [ref=e480]: "1280"
                  - generic [ref=e481]:
                    - generic [ref=e482]: Skill
                    - generic [ref=e483]: Skill 1 of 5
                - generic [ref=e490]:
                  - paragraph [ref=e491]: This season
                  - generic [ref=e492]:
                    - generic [ref=e493]:
                      - generic [ref=e494]: "10"
                      - generic [ref=e495]: P
                    - generic [ref=e496]:
                      - generic [ref=e497]: "3"
                      - generic [ref=e498]: W
                    - generic [ref=e499]:
                      - generic [ref=e500]: "4"
                      - generic [ref=e501]: D
                    - generic [ref=e502]:
                      - generic [ref=e503]: "3"
                      - generic [ref=e504]: L
                    - generic [ref=e505]:
                      - generic [ref=e506]: "13"
                      - generic [ref=e507]: Pts
          - generic [ref=e508]:
            - generic [ref=e509]:
              - link "Edit Pikey" [ref=e510] [cursor=pointer]:
                - /url: /players/edit/73086dd7-ceea-4607-9071-3dbf0296f1bb
              - button "Delete Pikey" [ref=e514]
            - 'link "Pikey #3 21 of 45 all time · 47% W W L W D Elo 1351 Skill Skill 2 of 5 This season 11 P 5 W 5 D 1 L 20 Pts" [ref=e518] [cursor=pointer]':
              - /url: /players/73086dd7-ceea-4607-9071-3dbf0296f1bb
              - generic [ref=e519]:
                - generic [ref=e520]:
                  - generic [ref=e521]: P
                  - generic [ref=e523]:
                    - generic [ref=e524]:
                      - heading "Pikey" [level=3] [ref=e525]
                      - generic [ref=e526]: "#3"
                    - paragraph [ref=e527]: 21 of 45 all time · 47%
                    - generic [ref=e530]:
                      - generic "Win" [ref=e531]: W
                      - generic "Win" [ref=e532]: W
                      - generic "Loss" [ref=e533]: L
                      - generic "Win" [ref=e534]: W
                      - generic "Draw" [ref=e535]: D
                - generic [ref=e536]:
                  - generic [ref=e537]:
                    - generic [ref=e538]: Elo
                    - generic [ref=e539]: "1351"
                  - generic [ref=e540]:
                    - generic [ref=e541]: Skill
                    - generic [ref=e542]: Skill 2 of 5
                - generic [ref=e549]:
                  - paragraph [ref=e550]: This season
                  - generic [ref=e551]:
                    - generic [ref=e552]:
                      - generic [ref=e553]: "11"
                      - generic [ref=e554]: P
                    - generic [ref=e555]:
                      - generic [ref=e556]: "5"
                      - generic [ref=e557]: W
                    - generic [ref=e558]:
                      - generic [ref=e559]: "5"
                      - generic [ref=e560]: D
                    - generic [ref=e561]:
                      - generic [ref=e562]: "1"
                      - generic [ref=e563]: L
                    - generic [ref=e564]:
                      - generic [ref=e565]: "20"
                      - generic [ref=e566]: Pts
          - generic [ref=e567]:
            - generic [ref=e568]:
              - link "Edit Ritchie" [ref=e569] [cursor=pointer]:
                - /url: /players/edit/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
              - button "Delete Ritchie" [ref=e573]
            - 'link "Ritchie #12 7 of 45 all time · 16% L L Elo 1030 Skill Skill 3 of 5 This season 8 P 2 W 3 D 3 L 9 Pts" [ref=e577] [cursor=pointer]':
              - /url: /players/a18c31af-166b-43ba-8bf3-db8bc9bc2e66
              - generic [ref=e578]:
                - generic [ref=e579]:
                  - generic [ref=e580]: R
                  - generic [ref=e582]:
                    - generic [ref=e583]:
                      - heading "Ritchie" [level=3] [ref=e584]
                      - generic [ref=e585]: "#12"
                    - paragraph [ref=e586]: 7 of 45 all time · 16%
                    - generic [ref=e589]:
                      - generic "Loss" [ref=e590]: L
                      - generic "Did Not Play" [ref=e591]
                      - generic "Loss" [ref=e597]: L
                      - generic "Did Not Play" [ref=e598]
                      - generic "Did Not Play" [ref=e604]
                - generic [ref=e610]:
                  - generic [ref=e611]:
                    - generic [ref=e612]: Elo
                    - generic [ref=e613]: "1030"
                  - generic [ref=e614]:
                    - generic [ref=e615]: Skill
                    - generic [ref=e616]: Skill 3 of 5
                - generic [ref=e623]:
                  - paragraph [ref=e624]: This season
                  - generic [ref=e625]:
                    - generic [ref=e626]:
                      - generic [ref=e627]: "8"
                      - generic [ref=e628]: P
                    - generic [ref=e629]:
                      - generic [ref=e630]: "2"
                      - generic [ref=e631]: W
                    - generic [ref=e632]:
                      - generic [ref=e633]: "3"
                      - generic [ref=e634]: D
                    - generic [ref=e635]:
                      - generic [ref=e636]: "3"
                      - generic [ref=e637]: L
                    - generic [ref=e638]:
                      - generic [ref=e639]: "9"
                      - generic [ref=e640]: Pts
          - generic [ref=e641]:
            - generic [ref=e642]:
              - link "Edit Scouse" [ref=e643] [cursor=pointer]:
                - /url: /players/edit/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
              - button "Delete Scouse" [ref=e647]
            - 'link "Scouse #4 17 of 54 all time · 31% L W W W D Elo 1171 Skill Skill 4 of 5 This season 15 P 4 W 6 D 5 L 18 Pts" [ref=e651] [cursor=pointer]':
              - /url: /players/4c2891be-10f4-4fe5-97a0-3b30bc6fb582
              - generic [ref=e652]:
                - generic [ref=e653]:
                  - generic [ref=e654]: S
                  - generic [ref=e656]:
                    - generic [ref=e657]:
                      - heading "Scouse" [level=3] [ref=e658]
                      - generic [ref=e659]: "#4"
                    - paragraph [ref=e660]: 17 of 54 all time · 31%
                    - generic [ref=e663]:
                      - generic "Loss" [ref=e664]: L
                      - generic "Win" [ref=e665]: W
                      - generic "Win" [ref=e666]: W
                      - generic "Win" [ref=e667]: W
                      - generic "Draw" [ref=e668]: D
                - generic [ref=e669]:
                  - generic [ref=e670]:
                    - generic [ref=e671]: Elo
                    - generic [ref=e672]: "1171"
                  - generic [ref=e673]:
                    - generic [ref=e674]: Skill
                    - generic [ref=e675]: Skill 4 of 5
                - generic [ref=e682]:
                  - paragraph [ref=e683]: This season
                  - generic [ref=e684]:
                    - generic [ref=e685]:
                      - generic [ref=e686]: "15"
                      - generic [ref=e687]: P
                    - generic [ref=e688]:
                      - generic [ref=e689]: "4"
                      - generic [ref=e690]: W
                    - generic [ref=e691]:
                      - generic [ref=e692]: "6"
                      - generic [ref=e693]: D
                    - generic [ref=e694]:
                      - generic [ref=e695]: "5"
                      - generic [ref=e696]: L
                    - generic [ref=e697]:
                      - generic [ref=e698]: "18"
                      - generic [ref=e699]: Pts
          - generic [ref=e700]:
            - generic [ref=e701]:
              - link "Edit Tosh" [ref=e702] [cursor=pointer]:
                - /url: /players/edit/4797c47e-f158-4d54-ac45-d9a061669871
              - button "Delete Tosh" [ref=e706]
            - 'link "Tosh #2 14 of 51 all time · 27% W W L D Elo 1166 Skill Skill 5 of 5 This season 14 P 5 W 6 D 3 L 21 Pts" [ref=e710] [cursor=pointer]':
              - /url: /players/4797c47e-f158-4d54-ac45-d9a061669871
              - generic [ref=e711]:
                - generic [ref=e712]:
                  - generic [ref=e713]: T
                  - generic [ref=e715]:
                    - generic [ref=e716]:
                      - heading "Tosh" [level=3] [ref=e717]
                      - generic [ref=e718]: "#2"
                    - paragraph [ref=e719]: 14 of 51 all time · 27%
                    - generic [ref=e722]:
                      - generic "Win" [ref=e723]: W
                      - generic "Win" [ref=e724]: W
                      - generic "Did Not Play" [ref=e725]
                      - generic "Loss" [ref=e731]: L
                      - generic "Draw" [ref=e732]: D
                - generic [ref=e733]:
                  - generic [ref=e734]:
                    - generic [ref=e735]: Elo
                    - generic [ref=e736]: "1166"
                  - generic [ref=e737]:
                    - generic [ref=e738]: Skill
                    - generic [ref=e739]: Skill 5 of 5
                - generic [ref=e746]:
                  - paragraph [ref=e747]: This season
                  - generic [ref=e748]:
                    - generic [ref=e749]:
                      - generic [ref=e750]: "14"
                      - generic [ref=e751]: P
                    - generic [ref=e752]:
                      - generic [ref=e753]: "5"
                      - generic [ref=e754]: W
                    - generic [ref=e755]:
                      - generic [ref=e756]: "6"
                      - generic [ref=e757]: D
                    - generic [ref=e758]:
                      - generic [ref=e759]: "3"
                      - generic [ref=e760]: L
                    - generic [ref=e761]:
                      - generic [ref=e762]: "21"
                      - generic [ref=e763]: Pts
  - region "Notifications (F8)":
    - list
  - generic [ref=e768] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e769]
    - generic [ref=e773]:
      - button "Open issues overlay" [ref=e774]:
        - generic [ref=e775]:
          - generic [ref=e776]: "0"
          - generic [ref=e777]: "1"
        - generic [ref=e778]: Issue
      - button "Collapse issues badge" [ref=e779]
  - alert [ref=e782]
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