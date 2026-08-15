-- Make joining a team by its id possible at all.
--
-- Both SELECT policies on `teams` require the caller to already be a member,
-- so the lookup the join form does first — "is there a team with this id?" —
-- returns nothing to the one person who needs an answer, and the form reports
-- the team does not exist. Joining has never worked.
--
-- Definer rights, because the whole point is to act before membership exists.
-- The exposure is deliberately narrow: it answers only for an id the caller
-- already holds, which is what makes the id usable as an invite code, and the
-- only row it can write is one making the caller themselves a viewer. It
-- cannot enumerate teams, add anybody else, or grant admin.

CREATE OR REPLACE FUNCTION "public"."join_team"("team_id_param" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" = ''
    AS $$
DECLARE
  found_team RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must be signed in to join a team';
  END IF;

  SELECT id, name, created_at
    INTO found_team
    FROM public.teams
   WHERE id = team_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.team_members
     WHERE team_id = team_id_param
       AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('status', 'already_member');
  END IF;

  -- Viewer, never admin: an invite code gets you in, not in charge.
  INSERT INTO public.team_members (team_id, user_id, role, created_at)
  VALUES (team_id_param, auth.uid(), 'viewer', now());

  RETURN json_build_object(
    'status', 'joined',
    'team', json_build_object(
      'id', found_team.id,
      'name', found_team.name,
      'created_at', found_team.created_at
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION "public"."join_team"("uuid") FROM PUBLIC, "anon";
GRANT EXECUTE ON FUNCTION "public"."join_team"("uuid") TO "authenticated";
