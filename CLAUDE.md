# Working in this repo

Guidance for AI agents. Human-facing docs are [README](README.md),
[SETUP](SETUP.md) and [DEPLOY](DEPLOY.md) — read those for what the app is and
how to run it.

## Before you finish

```bash
npm run check          # typecheck → lint → knip → unit tests
```

This must pass. Also run, when relevant:

| Changed | Run |
|---|---|
| `supabase/migrations/` | apply locally with `supabase db reset`, then `npm run seed:local` |
| Anything visual | `npm run e2e:shots`, then **look at the screenshots** |

Don't claim something works because it compiles. The build passing and the
feature working are different claims — the matches list rendered perfectly and
was thirty-two thousand pixels tall on a phone.

`typecheck` deliberately runs with `--incremental false`. A stale
`tsconfig.tsbuildinfo` once reported success with thirty errors in the tree.

## Non-negotiables

**Derive, never cache.** A player's record, rating and form are all computed
from the matches on every read. Do not add a column, a table or a state
variable that stores a tally — the app used to keep `players.stats` up to date
by hand, and a card showed "No matches played" beside a season of twelve.
If two things can disagree, eventually they will.

**One component per concept.** A player's face is `PlayerAvatar`, everywhere.
Their record comes from `usePlayerRecords`, everywhere. Rendering either by
hand at a call site is how the avatar picker ended up storing `icon:Ghost` and
eight of the nine places that displayed it showed a broken image.

**Never put a secret in a `NEXT_PUBLIC_` variable.** The two Supabase values
are public by design and row-level security is what protects the data. The
`service_role` key is not used anywhere in this app and must not be introduced.

**RLS is the only thing between one team and another's data.** Every `select()`
in `lib/` also filters on the team id in `localStorage`, but that is a
convenience, not a control. A new table needs a `GRANT` *and* a policy; they
are independent gates.

**A permissive policy of `USING (true)` cancels every other policy on that
table.** Policies are OR'd. Three tables had one.

**The demo team is readable by everyone and writable by no one.** One team
carries `is_demo`. Each of `teams`, `players`, `matches` and `seasons` has a
SELECT policy scoped to it — scoped, because a policy saying true for anybody
says true for every row of every team. It has no owner and no members, so the
existing admin-only write policies already refuse every write; there is no
demo write policy to relax by accident. `team_members` gains nothing, so who
is in it stays as private as any other team. `e2e/demo-team.spec.ts` holds
that line.

**Views bypass RLS unless they set `security_invoker = on`.** A view runs as
its owner by default. All of ours set it; a new one must too.

**Permissions are unknown before the team loads.** `usePermission()` returns
`ready`. Guard on it — "unknown" is not "not allowed", and skipping this made
`/matches/create` redirect every visitor to the dashboard.

**Never edit an applied migration.** Add a new one. Regenerate
`lib/database.types.ts` afterwards with `npm run types:db`.

**Server components can't be imported by client components.** Anything calling
`supabaseServer()` (which imports `next/headers`) must be rendered in a page
and passed down as a prop.

## Architecture

Pages carry `"use client"` and fetch through TanStack Query against
`lib/supabase-browser.ts`. The server resolves the session and the theme in
`app/layout.tsx` so the first paint knows both, and `proxy.ts` gates the routes.

`app/(app)/` is the signed-in shell. `/login` sits outside it.

**Colours are semantic tokens**, defined once in `app/globals.css` and mapped
into Tailwind under `@theme inline` — `inline` because the values reference
custom properties, and without it flipping `[data-theme]` would change nothing.
Never write `bg-gray-900` or `text-green-400`: use `bg-surface`, `text-win`.
Win, draw and loss have tokens of their own because they are the app's whole
vocabulary and the raw Tailwind colours fail contrast on a white card.

**Charts can't use `var()`** — Recharts writes SVG presentation attributes.
Use `useChartTheme()`, which re-reads on theme change.

**Motion is `motion/react`**, and every animation must survive
`prefers-reduced-motion`. The e2e run forces it, so anything that only works
while animating will fail there.

## Where things live

| | |
|---|---|
| `lib/config.ts` | Every tunable value. Points are NOT here — the views own them |
| `lib/elo.ts` | The rating model, pure and tested |
| `lib/team-balance.ts` | Splitting a group into two sides |
| `lib/form.ts` | Recent form over a window |
| `lib/head-to-head.ts` | How two players do together and against |
| `lib/player-stats.ts` | The all-time record, read through `usePlayerRecords` |
| `lib/avatars.ts` | The avatar registry and what the `image` column can hold |
| `proxy.ts` | Session refresh and the auth gate |
| `supabase/migrations/` | Schema; never edit an applied one |
| `tests/` | Unit tests over the pure logic in `lib/` |
| `e2e/` | Playwright; `screenshots.spec.ts` is the visual record |

## Conventions

Comments explain **why**, not what. Prefer a comment at the line over a note in
a doc — the doc will drift.

**Never put a countable fact in a doc.** No test counts, file counts, coverage
percentages or dependency versions in prose. Describe what a thing covers, not
how much of it there is.

**Comments describe the code as it stands, never how it got there.** No
"previously…", "was X", "this replaces…". If the rationale only makes sense as
a contrast, state the constraint instead. Same for naming — no `NewFoo`,
`FooV2`, or `legacy` prefixes for code that is simply the code.

**Keep commit messages and PR bodies plain.** A subject line, then a few short
paragraphs of prose. No headings, no tables, no bullet lists, no emoji. Don't
hard-wrap: one paragraph per line.

**Never mention AI tooling anywhere in the repo or its history.** No
`Co-Authored-By` trailer, no "Generated with…" footer, no mention in a comment,
commit message, PR title or body, or branch name. This holds even when the
tool's own defaults ask for it.

Match the surrounding style. British English in user-facing copy.

Tests assert behaviour, not implementation. When fixing a bug, add the test
that would have caught it.

Don't leave commented-out code, `console.log`, or `TODO` without context.

## Scope

Do what was asked. If you spot something else worth fixing, say so rather than
silently expanding the change.

Flag uncertainty rather than guessing — especially anything touching real user
data, migrations against the live project, or a deployment.
