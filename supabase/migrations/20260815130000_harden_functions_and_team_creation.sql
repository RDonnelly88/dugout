-- Close the findings from the Supabase security advisor, plus two things it
-- doesn't check for.

-- 1. Another permissive policy cancelling a real one.
--
-- `Anyone can create teams` is WITH CHECK (true) for INSERT, and it sits beside
-- `Team creators can insert teams`, which requires created_by = auth.uid().
-- Policies are OR'd, so the first defeats the second and a team could be
-- inserted attributed to anybody. Dropping it leaves the check in force.

DROP POLICY IF EXISTS "Anyone can create teams" ON "public"."teams";

-- 2. Team creation no longer takes the owner as an argument.
--
-- It took `user_id` as a parameter and wrote it straight into teams.created_by
-- and team_members, without ever consulting auth.uid(). As SECURITY DEFINER
-- reachable from PostgREST, that let any caller — including an unauthenticated
-- one — create a team owned by, and administered by, someone else.
--
-- SECURITY INVOKER instead of DEFINER: both inserts are already permitted by
-- policy for the person doing them (`created_by = auth.uid()` on teams,
-- `auth.uid() = user_id` on team_members), so the function needs no privileges
-- of its own and row-level security does the checking.

DROP FUNCTION IF EXISTS "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid");

CREATE OR REPLACE FUNCTION "public"."create_team_with_admin"("team_name" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY INVOKER
    SET "search_path" = ''
    AS $$
DECLARE
  new_team_id UUID := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must be signed in to create a team';
  END IF;

  -- The id is generated here rather than read back with RETURNING. A RETURNING
  -- clause makes Postgres apply the SELECT policies to the new row, and both
  -- SELECT policies on teams require a matching team_members row — which the
  -- very next statement is what creates. Returning the id would deadlock the
  -- function against its own first insert.
  INSERT INTO public.teams (id, name, created_by, created_at, updated_at)
  VALUES (new_team_id, team_name, auth.uid(), now(), now());

  INSERT INTO public.team_members (team_id, user_id, role, created_at)
  VALUES (new_team_id, auth.uid(), 'admin', now());

  RETURN json_build_object('team_id', new_team_id);
END;
$$;

-- 3. The member list stops being a public directory.
--
-- It was SECURITY DEFINER with no membership check of any kind, so any team id
-- returned that team's members — including profiles.username, which is the
-- account's email address. Reachable by anon over /rest/v1/rpc.
--
-- SECURITY INVOKER makes the existing policies apply: `Team members can view
-- members` limits team_members to teams you belong to, so a non-member gets an
-- empty result instead of a roster.

CREATE OR REPLACE FUNCTION "public"."get_team_members"("team_id_param" "uuid")
    RETURNS TABLE("id" "uuid", "user_id" "uuid", "team_id" "uuid", "role" "text", "created_at" timestamp with time zone, "username" "text", "avatar_url" "text")
    LANGUAGE "plpgsql" SECURITY INVOKER
    SET "search_path" = ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.user_id,
    tm.team_id,
    tm.role::TEXT,
    tm.created_at,
    p.username,
    p.avatar_url
  FROM
    public.team_members tm
    LEFT JOIN public.profiles p ON tm.user_id = p.id
  WHERE
    tm.team_id = team_id_param;
END;
$$;

-- 4. The RLS helpers keep SECURITY DEFINER but get a fixed search_path.
--
-- These have to stay DEFINER: they are called from the policies on
-- team_members, and an invoker-rights version would re-enter those policies and
-- recurse — which is what the `_no_recursion` pair exists to avoid.
--
-- `SET search_path = ''` is what the advisor is asking for. Without it the
-- function resolves `team_members` against whatever search_path the caller
-- brought, so anyone able to create a shadowing object could make an
-- admin check return true. Every reference below is schema-qualified, which is
-- what an empty search_path requires.
--
-- STABLE for the same reason as the previous migration: they are called once
-- per row during policy evaluation.

CREATE OR REPLACE FUNCTION "public"."is_team_member"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" = ''
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
    SET "search_path" = ''
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

CREATE OR REPLACE FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" = ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = user_uuid
  );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" = ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = user_uuid
    AND role = 'admin'
  );
END;
$$;

-- 5. The two trigger functions.
--
-- `handle_new_user` fires on auth.users and has to stay DEFINER to write into
-- public.profiles.
--
-- `set_current_season` also gains a team_id filter. It cleared is_current on
-- every season whose id differed from the new one, with no regard for which
-- team owned them — so one group marking a season current silently un-set the
-- current season for every other group in the database.

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" = ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."set_current_season"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" = ''
    AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE public.seasons
        SET is_current = false
        WHERE id != NEW.id
          AND team_id IS NOT DISTINCT FROM NEW.team_id;
    END IF;
    RETURN NEW;
END;
$$;

-- 6. Take the functions out of the anonymous API surface.
--
-- Supabase grants EXECUTE broadly by default, so every one of these was
-- callable over /rest/v1/rpc without signing in. Nothing here has an anonymous
-- caller: the policies that use the helpers are all `TO authenticated`, and the
-- two trigger functions are invoked by the system rather than by anyone — a
-- trigger's permission check happens when the trigger is created, not each time
-- it fires, so revoking EXECUTE does not stop them running.

REVOKE ALL ON FUNCTION "public"."is_team_member"("uuid") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."is_team_admin"("uuid") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."is_team_member_no_recursion"("uuid", "uuid") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."is_team_admin_no_recursion"("uuid", "uuid") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."create_team_with_admin"("text") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."get_team_members"("uuid") FROM PUBLIC, "anon";
REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC, "anon", "authenticated";
REVOKE ALL ON FUNCTION "public"."set_current_season"() FROM PUBLIC, "anon", "authenticated";

GRANT EXECUTE ON FUNCTION "public"."is_team_member"("uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_team_admin"("uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_team_member_no_recursion"("uuid", "uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_team_admin_no_recursion"("uuid", "uuid") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."create_team_with_admin"("text") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."get_team_members"("uuid") TO "authenticated";
