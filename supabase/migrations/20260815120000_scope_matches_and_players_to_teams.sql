-- Remove the two policies that made matches and players world-readable.
--
-- Row-level security policies are permissive and OR'd together, so a policy of
-- `USING (true)` with no role restriction is not one policy among several — it
-- is the only one that matters. These two sat alongside the team-scoped
-- policies and cancelled them outright. Combined with `GRANT ALL ... TO anon`
-- on both tables, the anon key was enough to read and write every team's
-- matches and players without signing in, and that key ships in the browser
-- bundle by design.
--
-- Nothing replaces them. The four team-scoped policies that remain already
-- cover everything the app does:
--
--   matches   Team members can view matches   SELECT, authenticated
--             Team admins can manage matches  ALL,    authenticated
--   players   Team members can view players   SELECT, authenticated
--             Team admins can manage players  ALL,    authenticated
--
-- After this, an anon request matches no permissive policy on either table and
-- comes back empty rather than with the lot. The `GRANT`s to anon are left
-- alone: they are the Supabase default, and with no policy to satisfy they
-- grant nothing.

DROP POLICY IF EXISTS "Allow public access to matches" ON "public"."matches";
DROP POLICY IF EXISTS "Allow public access to players" ON "public"."players";

-- Both remaining pairs still start `team_id IS NULL OR …`, so any row that
-- predates teams stays visible to every signed-in account. That is a separate
-- decision from this one — tightening it would hide existing data — so it is
-- deliberately left as it is.
