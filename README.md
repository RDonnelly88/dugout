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

## Open items

Carried over from the Lovable build, not introduced by the move to Next. Each
is a decision to make rather than a task already agreed.

**Two policies leave `matches` and `players` open to anyone.**
`CREATE POLICY "Allow public access to matches" ON matches USING (true)` — and
the same for `players` — have no role restriction, and `anon` holds `GRANT ALL`
on both tables. RLS policies are OR'd, so these cancel the team-scoped policies
sitting beside them. Anyone with the anon key, which ships in the browser
bundle by design, can read and write every team's matches and players without
signing in. Dropping both policies is the fix; the team-scoped ones already
cover the app's own access.

**The three views bypass RLS.** `season_player_stats`, `season_champions` and
`player_match_results` were created without `security_invoker`, so they run as
their owner and return every team's rows regardless of the policies on the
underlying tables. `lib/season/season-retrieval.ts` compensates by checking the
season's `team_id` in client code first, which a client can simply not do.
`ALTER VIEW … SET (security_invoker = on)` moves the check to where it can't be
skipped.

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
