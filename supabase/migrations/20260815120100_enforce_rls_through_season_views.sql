-- Make the season views honour row-level security.
--
-- A view runs as its owner unless it says otherwise, so these three read
-- matches, players and seasons as `postgres` and returned every team's rows no
-- matter what the policies on those tables said. `lib/season/season-retrieval.ts`
-- works around it by looking up the season's `team_id` and comparing it in
-- client code before querying the view — a check the client can simply not
-- perform. `security_invoker` moves it to where it cannot be skipped.
--
-- The setting has to go on all three. `season_champions` selects from
-- `season_player_stats`, and a nested view that still runs as its owner would
-- hand back unfiltered rows for the outer one to pass straight through.

ALTER VIEW "public"."player_match_results" SET (security_invoker = on);
ALTER VIEW "public"."season_player_stats" SET (security_invoker = on);
ALTER VIEW "public"."season_champions" SET (security_invoker = on);

-- Declare the two policy helpers STABLE.
--
-- Neither had a volatility marker, so both defaulted to VOLATILE, and Postgres
-- must call a volatile function once per row rather than once per query. That
-- cost nothing while the views bypassed policies. It does now:
-- `season_player_stats` cross-joins seasons against players before it joins
-- matches, and every candidate row would otherwise mean another
-- `SELECT 1 FROM team_members`.
--
-- STABLE is the accurate marker — both only read, and neither can see a change
-- made later in the same statement.
--
-- Recreated rather than altered because CREATE OR REPLACE FUNCTION needs the
-- whole definition; the bodies are unchanged.

CREATE OR REPLACE FUNCTION "public"."is_team_member"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."is_team_admin"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;
