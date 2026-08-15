# Deployment

**This project is deployed.** What follows is how to operate it, then how it was
provisioned in case it ever needs recreating.

| | |
|---|---|
| **App** | https://the-dugout-fives.vercel.app |
| **Repo** | `RDonnelly88/dugout` |
| **Vercel project** | `dugout`, team *Ross' projects*, functions pinned to `lhr1`, Node 24 |
| **Supabase project** | `5s Tracker`, ref `zeuepyucpafcjibsofec`, region `eu-west-2` |
| **Auth** | password, email magic link, passkeys |

[Vercel dashboard](https://vercel.com/ross-projects-062c1bee/dugout) ·
[Supabase dashboard](https://supabase.com/dashboard/project/zeuepyucpafcjibsofec)

`the-dugout-fives.vercel.app` is a claimed subdomain rather than the generated
one. Vercel's own name for the project is `dugout-fawn.vercel.app`, because
`dugout.vercel.app` was already taken — it still resolves, and so does the
per-deployment URL, but the claimed name is the one to share.

Deployment protection is on Standard Protection, which is Vercel's default and
wants no changing: the production alias above is public, and only the generated
per-deployment URLs ask for a Vercel login. Testing protection against a
generated URL and concluding the site is private is an easy mistake to make.

---

## Provisioning

### 1. Vercel project

```bash
npx vercel link          # pick or create the project
```

`vercel.json` already sets the framework and pins functions to `lhr1`, which is
the same region as the database — anything further away pays a round trip on
every query.

`vercel link` appends a broad `.env*` line to `.gitignore`, which would untrack
`.env.local.example`. Check the file afterwards.

### 2. Environment variables

Two, both needed in all three environments:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zeuepyucpafcjibsofec.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Project Settings → API Keys |

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# repeat for preview and development
```

Both ship to the browser, so neither is a secret. If you ever want CI building
against the real project rather than the placeholders in
`.github/workflows/ci.yml`, add them as repository **variables**, not secrets —
a secret would be redacted in the build log while still appearing in the
bundle.

### 3. Auth redirect URLs

Supabase → Authentication → URL Configuration:

| Field | Value |
|---|---|
| Site URL | the production URL |
| Redirect URLs | the production URL, plus `https://*-<your-team>.vercel.app/**` for previews |

Without the wildcard, sign-in on a preview deployment bounces back to
localhost.

### 4. Authentication

Supabase → Authentication → URL Configuration:

| Field | Value |
|---|---|
| Site URL | `https://the-dugout-fives.vercel.app` |
| Redirect URLs | the same, plus `/auth/callback`, plus `https://dugout-*-ross-projects-062c1bee.vercel.app/**` for previews |

Without the wildcard, sign-in on a preview deployment bounces back to
localhost.

Passkeys are enabled under Authentication as well, and need `rp_id` set to the
production hostname. The `[auth.webauthn]` block in `supabase/config.toml`
governs the local Docker stack only — a hosted project never reads that file,
so a passkey ceremony fails there while the config looks correct locally.

**Settle the hostname before enabling passkeys.** `rp_id` is stamped into every
credential an authenticator stores, and a credential is only ever offered back
to the relying party it was created for. Moving to a custom domain later does
not migrate anything: every passkey already enrolled silently stops being
offered, and everyone has to enrol again.

---

## Operating it

### Shipping a change

Work on a branch, open a PR, let CI go green, squash-merge.

```bash
git switch -c thing/i-am-doing
# … commits …
git push -u origin thing/i-am-doing
gh pr create --fill
gh pr checks --watch
gh pr merge --squash
```

Every PR gets its own preview URL. Previews share the production database, so
treat anything you do on one as real.

### Migrations

The schema is in `supabase/migrations/`. To add one:

```bash
supabase migration new what_it_does
# … write the SQL …
supabase db push
npm run types:db          # regenerate the generated types
```

`db push` is blocked until the hosted project's migration history is reconciled
with the repo — see the note in [SETUP.md](SETUP.md#migration-history).

A new table needs both a `GRANT` and an RLS policy. They are independent gates:
a policy on its own grants nothing, and every query fails with `permission
denied for table …`. A `GRANT` on its own, with RLS enabled and no policy,
returns zero rows rather than an error, which is the more confusing failure.

### Rollback

Vercel keeps every deployment. To go back, promote an earlier one from the
dashboard or:

```bash
npx vercel rollback
```

That reverts the application only. A migration is not rolled back with it —
write a forward migration that undoes the change.
