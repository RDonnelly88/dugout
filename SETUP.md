# Local development

Day-to-day notes. For deploying and migrations see **[DEPLOY.md](DEPLOY.md)**.

## Getting running

```bash
nvm use          # Node 24, per .nvmrc
npm install
cp .env.local.example .env.local   # then fill in the two Supabase values
npm run dev      # http://localhost:3000
```

The two values come from the Supabase dashboard under **Project Settings → API
Keys**, or from `vercel env pull .env.local` once the project is linked.

To work against a local database with a squad already in it:

```bash
supabase start       # needs Docker; applies every migration to a fresh Postgres
npm run seed:local   # twelve players, two seasons, a season and a half of results
```

Then point `.env.local` at the stack it prints — the API URL and the anon key
from `supabase status` — and sign in as `demo@example.test` with the password
the seed prints. `supabase stop` when you're done; the containers are several
GB.

The seed comes from a fixed generator, so a second run produces the same squad.
Each player carries a hidden strength that only weights the scorelines, so the
table settles into an order rather than everyone converging on half their
games. Nothing stores it and the app never sees it.

| Service | URL |
|---|---|
| API | http://127.0.0.1:54331 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54332/postgres` |
| Studio | http://127.0.0.1:54333 |
| Mail catcher | http://127.0.0.1:54334 |

Those are shifted off the CLI's defaults in `supabase/config.toml` so this
stack can run alongside another local Supabase project. On the defaults the
second one to start fails to bind and the error doesn't say why.

Both are `NEXT_PUBLIC_*`, which means Next inlines them into the bundle served
to the browser. They are not secrets and cannot be — the browser has to hold
them to talk to Supabase at all. Row-level security is what protects the data.
Never put the service-role key in this file.

`lib/env.ts` validates both at import time, so a missing or malformed value
fails with a readable message rather than surfacing later as `undefined`.

**`.env.local` points at production unless you change it.** Out of the box
`npm run dev` reads and writes the real database. Be careful what you click.

The end-to-end specs never touch it: they run their own dev server on port 3100
with the local stack's keys, because they write data and inheriting whichever
database a running server was started against is how a test suite ends up
editing real matches.

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

`npm run test` covers the pure logic in `lib/` — the ranking rules, the Elo
model, team balancing, recent form, head-to-head records and CSV escaping.
Tests import as `@/lib/…`, the same path the app uses, via the alias in
`vitest.config.ts`.

```bash
npm run e2e         # sign in and drive the app
npm run e2e:shots   # photograph every page, both themes, desktop and mobile
```

Both need `supabase start` and `npm run seed:local` first.

The screenshots are not assertions — they are a folder to open. Reviewing a
visual change means looking at them, which is the only way to catch something
that renders correctly and looks wrong. They also catch what a person scrolling
past would not: the matches list was found to be over thirty-two thousand
pixels tall on a phone because Playwright refused to photograph it.

The specs force `prefers-reduced-motion`. Playwright will not click an element
whose bounding box is still moving, so anything that animates indefinitely
would time out — and it stops the record catching a chart mid-draw.

Nothing touching Supabase has unit coverage. If you change a page, run it and
look at it.

## Database

The schema lives in `supabase/migrations/`, starting from a snapshot captured
from the hosted project, since nothing before that point was ever written down.

`supabase db reset` rebuilds the local database from those migrations and drops
whatever was in it, so re-run `npm run seed:local` afterwards.

After any migration, regenerate the types:

```bash
npm run types:db
```

That file is what makes a `select()` return real column types instead of `any`.
Never edit it by hand, and never edit a migration that has been applied.

### Migration history

Reconciled — `supabase migration list` shows local and remote agreeing, and
`db push` works normally.

It needed repairing once, because the hosted project's history table listed the
Lovable-era entries that the captured snapshot replaced. If you ever hit the
same mismatch (restoring a backup, or pointing at a second project), the shape
of the fix is to mark the stale entries reverted and the snapshot applied:

```bash
supabase migration repair --status reverted <stale-version>
supabase migration repair --status applied  20250322000000
```

`repair` writes only to `supabase_migrations.schema_migrations`, the
bookkeeping table — it doesn't touch the schema or any data. Check `supabase
migration list` before and after, and take the versions from what that prints
rather than from here.

## Things that will surprise you

**The team id comes from `localStorage`.** Every query in `lib/` filters on
`localStorage.getItem("currentTeamId")`. Clearing site data means no team is
selected and every list comes back empty until you pick one again.

**`vercel link` rewrites `.gitignore`.** It appends a broad `.env*` line that
would untrack `.env.local.example`. Check the file after running it. `vercel
env pull` overwrites `.env.local` outright.
