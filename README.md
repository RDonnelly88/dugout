<div align="center">

# Scoreboard Shenanigans

**Five-a-side results, player form and season standings for a group of mates.**

Match results scored three points a win · seasons with a champion · per-player
form and who you actually play well with.

[![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-087EA4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## What it does

**Records matches.** Two sides, a score, a date and an optional note. A match
belongs to a season, and only counts towards the table once it's marked
completed.

**Keeps a season table.** Three points a win, one a draw. The standings order on
points, then on games played — turning out more often breaks a tie in your
favour — then on wins. Identical records share a rank and the next player down
takes the position their count implies, so two players tied second are followed
by a fourth, not a third.

**Crowns a champion per season.** Seasons have a start, an end and a current
flag; when one is finished its winner is fixed.

**Shows a player's form and standing over time.** Last five results, current
rank, and a line chart of where each player sat in the table after every match
of the season.

**Shows who you play well with.** Best and worst teammate by win rate, most
frequent teammate, toughest and easiest opponent, and win and loss streaks —
overall or filtered to one season.

**Picks the teams.** Choose who's playing and the randomiser deals them out
into two sides, with a card-reveal animation and a formation view showing each
player's recent form.

**Separates one group from another.** A team owns its own players, matches and
seasons. Members are admins, who can change things, or viewers, who can't.

---

## How it's built

Next 16 on the App Router, React 19, Tailwind 4, Supabase for Postgres and
auth, deployed to Vercel.

Pages are client components fetching through TanStack Query. The server
resolves the session in the root layout, so the first paint knows who is signed
in, and `proxy.ts` refreshes the session cookie and turns away unauthenticated
requests before they reach a page.

Season standings are computed in Postgres — `season_player_stats` and
`season_champions` are views over `matches` and `players`, so the points
formula lives in one place and doesn't drift between the leaderboard and the
charts.

See [SETUP.md](SETUP.md) to run it, [DEPLOY.md](DEPLOY.md) to deploy it, and
[CLAUDE.md](CLAUDE.md) for the conventions.

---

## Written but not yet live

Two migrations sit in `supabase/migrations/` that have **not** been applied to
the hosted project. Both close data exposure carried over from the Lovable
build. Applying them needs the migration history reconciled first — see
[SETUP.md](SETUP.md#migration-history).

Until they are applied, the anon key is enough to read and write every team's
data, and that key is in the browser bundle by design.

**`…_scope_matches_and_players_to_teams`** drops a policy of `USING (true)` on
`matches` and another on `players`. Policies are OR'd, so those two cancelled
the team-scoped policies beside them. The four team-scoped policies that remain
already cover everything the app does.

**`…_enforce_rls_through_season_views`** sets `security_invoker = on` on
`season_player_stats`, `season_champions` and `player_match_results`. Without
it a view runs as its owner and ignores the policies on the tables underneath,
which is why `lib/season/season-retrieval.ts` checks `team_id` in client code
before querying — a check a client can simply skip. It also marks
`is_team_member` and `is_team_admin` `STABLE`: they had no volatility marker,
so Postgres would call them once per row rather than once per query, and
`season_player_stats` cross-joins seasons against players.

Verified on a local stack: after the migrations an anonymous caller reads zero
rows from all five relations and cannot insert, update or delete; a signed-in
team member reads their own team's rows; a signed-in non-member reads none.
Reverting the migrations in a transaction returns every row to the anonymous
caller, which is what makes the first result mean anything.

## Open items

Carried over from the Lovable build. Each is a decision rather than an agreed
task.

**Both remaining policy pairs start `team_id IS NULL OR …`**, so any row
predating teams is visible to every signed-in account. Tightening that would
hide existing data, so it wants checking against the real table first.

**Two ranking rules disagree.** `calculatePlayerRanks` orders on points, then
games played, then wins. The `season_champions` view orders on points then wins
and ignores games played. The leaderboard and the champion can therefore
disagree about who finished second.

**A stylesheet was written but never loaded.** The Lovable tree carried around
1,300 lines across `src/styles/` that nothing ever imported, so classes like
`.player-card`, `.revealed-card` and `.neon-glow` in the randomiser components
have never resolved to anything. Those files were dropped in the move rather
than switched on, because switching them on changes how the app looks. They're
in the history if you want them back.

**`lib/uuid.ts` rolls its own v4 from `Math.random()`.** `crypto.randomUUID()`
is available everywhere this runs.
