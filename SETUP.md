# Local development

Day-to-day notes. For deploying and migrations see **[DEPLOY.md](DEPLOY.md)**.

## Getting running

```bash
nvm use          # Node 22, per .nvmrc
npm install
cp .env.local.example .env.local   # then fill in the two Supabase values
npm run dev      # http://localhost:3000
```

The two values come from the Supabase dashboard under **Project Settings → API
Keys**, or from `vercel env pull .env.local` once the project is linked.

Both are `NEXT_PUBLIC_*`, which means Next inlines them into the bundle served
to the browser. They are not secrets and cannot be — the browser has to hold
them to talk to Supabase at all. Row-level security is what protects the data.
Never put the service-role key in this file.

`lib/env.ts` validates both at import time, so a missing or malformed value
fails with a readable message rather than surfacing later as `undefined`.

**`.env.local` points at production.** There is no local Supabase stack wired
up yet, so `npm run dev` reads and writes the real database. Be careful what
you click. Setting one up is the natural next step — the schema is captured in
`supabase/migrations/`, so `supabase start` followed by `supabase db reset`
would reproduce it.

## Before you push

```bash
npm run check    # typecheck → lint → knip → unit tests
```

CI runs the same four plus a build. Run `npm run build` yourself if you've
touched routes, `proxy.ts`, or anything else Next resolves at build time —
several classes of error only appear there.

| Command | What it does |
|---|---|
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run lint` | oxlint |
| `npm run knip` | unused files, exports and dependencies |
| `npm run test` | vitest, over the pure logic in `lib/` |
| `npm run build` | production build, including route collection |
| `npm run types:db` | regenerate `lib/database.types.ts` from the linked project |

Lint currently reports warnings but no errors — unused imports and missing
effect dependencies inherited from the generated code. They don't fail the
build. Clear the ones in a file you're already editing rather than doing a
sweep.

## Testing

`npm run test` covers the pure logic in `lib/` — currently the ranking rules.
Tests import as `@/lib/…`, the same path the app uses, via the alias in
`vitest.config.ts`.

Anything touching Supabase isn't covered, and neither is any page. If you
change a page, run it and look at it.

## Database

The schema lives in `supabase/migrations/`, starting from a single snapshot
captured from the hosted project — Lovable applied its changes directly to the
database, so nothing before that point was ever written down.

After any migration, regenerate the types:

```bash
npm run types:db
```

That file is what makes a `select()` return real column types instead of `any`.
Never edit it by hand, and never edit a migration that has been applied.

### Migration history

The hosted project's migration history table doesn't match what's in the repo —
it still lists the two Lovable migrations that the snapshot replaced. Until
that's reconciled, `supabase db pull` and `supabase db push` will refuse to
run. The Supabase CLI prints the exact repair commands when it fails; running
them writes only to the migration bookkeeping table, not to any data. Read what
it suggests before running it.

## Things that will surprise you

**The team id comes from `localStorage`.** Every query in `lib/` filters on
`localStorage.getItem("currentTeamId")`. Clearing site data means no team is
selected and every list comes back empty until you pick one again.

**`vercel link` rewrites `.gitignore`.** It appends a broad `.env*` line that
would untrack `.env.local.example`. Check the file after running it. `vercel
env pull` overwrites `.env.local` outright.
