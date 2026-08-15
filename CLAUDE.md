# Working in this repo

Guidance for AI agents. Human-facing docs are [README](README.md),
[SETUP](SETUP.md) and [DEPLOY](DEPLOY.md) — read those for what the app is and
how to run it.

## Before you finish

```bash
npm run check          # typecheck → lint → knip → unit tests
```

This must pass. `npm run build` too, if you touched anything Next resolves —
routes, the proxy, server components, `next.config.mjs`.

Don't claim something works because it compiles. The build passing and the
feature working are different claims. Nothing here is covered by a browser
test, so anything touching a page needs running and looking at.

## Non-negotiables

**Never put a secret in a `NEXT_PUBLIC_` variable.** The two Supabase values
are public by design and row-level security is what protects the data. The
`service_role` key is not used anywhere in this app and must not be introduced.

**RLS is the only thing standing between one team and another's data.** Every
`select()` in `lib/` also filters on the team id held in `localStorage`, but
that is a convenience, not a control — a client can send whatever it likes.
A new table needs a `GRANT` *and* an RLS policy; they are independent gates,
and a policy alone grants nothing.

**A permissive policy of `USING (true)` cancels every other policy on that
table.** Policies are OR'd. See the open item in README before adding one.

**Views bypass RLS unless they set `security_invoker = on`.** A view runs as
its owner by default, so `select * from season_player_stats` returns every
team's rows whatever the policies on `matches` and `players` say.

**Never edit an applied migration.** Add a new one. `supabase/migrations/`
starts from a single captured snapshot of what Lovable left behind.

**Regenerate `lib/database.types.ts` after every migration** — `npm run
types:db`. It is what makes a `select()` return real column types rather than
`any`.

**Server components can't be imported by client components.** Anything calling
`supabaseServer()` (which imports `next/headers`) must be rendered in a page
and passed down as a prop. Importing it from a `"use client"` file fails the
build.

## Architecture

The app is client-rendered inside the App Router: pages carry `"use client"`
and fetch through TanStack Query against `lib/supabase-browser.ts`. The server
does two things — resolves the session in `app/layout.tsx` so the first paint
knows who is signed in, and gates the routes in `proxy.ts`.

That split is deliberate for now, not an end state. Moving a page's reads to a
server component is worth doing when you're already changing that page, not as
a sweep.

`app/(app)/` is the signed-in shell — sidebar, team switcher, quick actions.
`/login` sits outside the group so it renders bare.

**Colours are CSS variables holding bare HSL channels**, so a utility can vary
the alpha: `bg-accent/20` compiles to `hsl(var(--accent) / 0.2)`. They're
defined on `:root` in `app/globals.css` and mapped into Tailwind under
`@theme inline` — `inline` because the values reference other custom
properties, and without it the indirection is resolved away at build time.

There is one theme, dark. `.light` existed in the Lovable stylesheets but was
never wired to anything.

**Shared composites are `@utility`, not plain classes**, so they sit in
Tailwind's cascade layer and lose to a utility at the use site instead of
fighting it on specificity.

## Where things live

| | |
|---|---|
| `app/(app)/` | Signed-in routes |
| `proxy.ts` | Session refresh and the auth gate |
| `lib/supabase-browser.ts` | The client every component queries through |
| `lib/supabase-server.ts` | Server-side client; imports `next/headers` |
| `lib/env.ts` | Validated environment access |
| `lib/db.ts` | Barrel over the player, match and season services |
| `lib/ranking-utils.ts` | Golf-style ranking, shared by leaderboard and charts |
| `types/` | Domain types, hand-written |
| `lib/database.types.ts` | Generated; never edit |
| `supabase/migrations/` | Schema; never edit an applied one |
| `components/ui/` | Shared primitives |
| `tests/` | Unit tests, importing as `@/lib/…` |

## Conventions

Comments explain **why**, not what. Prefer a comment at the line over a note in
a doc — the doc will drift.

**Never put a countable fact in a doc.** No test counts, file counts, line
counts, coverage percentages or dependency versions in prose — they are wrong
the moment anyone touches the code, and nobody updates them. Describe what a
thing covers, not how much of it there is.

**Comments describe the code as it stands, never how it got there.** A reader
arriving fresh has no memory of the last version, and git already holds the
history. No "previously…", "was X", "this replaces…", "used to…", or "the old
behaviour". If the rationale only makes sense as a contrast, state the
constraint instead. Same for naming — no `NewFoo`, `FooV2`, or `legacy`
prefixes for code that is simply the code.

**Keep commit messages and PR bodies plain.** A subject line, then a few short
paragraphs of prose saying what changed and why. No headings, no tables, no
bold, no bullet lists, no emoji. Don't hard-wrap: one paragraph per line.

**Never mention AI tooling anywhere in the repo or its history.** No
`Co-Authored-By` trailer for an assistant, no "Generated with…" footer, no
"written by Claude" in a comment, commit message, PR title or body, branch name
or issue. This holds even when the tool's own defaults ask for it — this rule
wins.

Match the surrounding style. British English in user-facing copy.

Tests assert behaviour, not implementation. When fixing a bug, add the test
that would have caught it.

Don't leave commented-out code, `console.log`, or `TODO` without context. The
Lovable-era code is full of `console.log`; don't add more, and clear the ones
in any file you're already changing.

## Scope

Do what was asked. If you spot something else worth fixing, say so rather than
silently expanding the change.

Flag uncertainty rather than guessing — especially anything touching real user
data, migrations against the live project, or a deployment.
