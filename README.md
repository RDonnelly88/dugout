<div align="center">

# The Dugout

**A league table for your five-a-side.**

Every result, every season, and who you actually play well with.

[![CI](https://github.com/RDonnelly88/dugout/actions/workflows/ci.yml/badge.svg)](https://github.com/RDonnelly88/dugout/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-the--dugout--fives.vercel.app-000?logo=vercel&logoColor=white)](https://the-dugout-fives.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-087EA4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## What it does

**Keeps the table.** Three points a win, one a draw. Standings order on points,
then on games played — turning out more often breaks a tie in your favour —
then on wins. Level records share a place, so two tied in second are followed
by a fourth.

**Runs seasons.** A season has a start, an end and a champion. Matches only
count towards the table once they're marked complete, so a fixture entered on
Tuesday doesn't move anything until it's played.

**Tracks form.** Last five results per player, current rank, and a chart of
where everyone sat in the table after every match of the season.

**Knows who you play well with.** Best and worst teammate by win rate, most
frequent teammate, toughest and easiest opponent, and win and loss streaks —
across all time or filtered to a single season.

**Picks the sides.** Choose who's playing and the randomiser deals them into
two teams, with a card reveal and a formation view showing each player's recent
form.

**Keeps groups apart.** A team owns its own players, matches and seasons.
Members are admins, who can change things, or viewers, who can't. Share the
team's code and someone can join themselves.

---

## How it works

Next on the App Router with React 19 and Tailwind 4, Postgres and auth from
Supabase, deployed to Vercel with functions in London — the same region as the
database, so a query doesn't cross an ocean to answer.

**Standings are computed in Postgres.** `season_player_stats` and
`season_champions` are views over matches and players, so the points formula
lives in one place and can't drift between the leaderboard, the champion and
the charts.

**Row-level security is the security model, not a layer on top of it.** Every
table is scoped to the teams you belong to, and the views enforce it too rather
than trusting the client to filter. The anon key ships in the browser bundle
because it's meant to — it reads nothing on its own.

**Sign in three ways.** Password, an emailed link, or a passkey. Sessions are
resolved on the server and refreshed by a proxy on every request, so a page
renders knowing who you are instead of flashing a spinner first.

---

## Running it

```bash
nvm use
npm install
cp .env.local.example .env.local   # fill in two Supabase values
npm run dev
```

```bash
npm run check    # typecheck → lint → dead code → tests
```

[SETUP](SETUP.md) covers local development and the database.
[DEPLOY](DEPLOY.md) covers shipping it. [CLAUDE](CLAUDE.md) is the house style.
