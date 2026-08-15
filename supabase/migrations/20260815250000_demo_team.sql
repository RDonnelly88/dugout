-- A team anybody signed in can look at, and nobody can touch.
--
-- Somebody arriving at the app has an empty squad, no matches and no table,
-- which is the worst possible view of what it does. The demo team is a season
-- and a half of a real-looking Tuesday league, readable by every signed-in
-- user and writable by none.
--
-- Read access is granted by adding one SELECT policy per table, scoped to the
-- demo team. Deliberately not `USING (true)` with a filter bolted on top:
-- permissive policies are OR'd, so a policy that says true for anybody says
-- true for every row of every team.
--
-- No write policy is added at all. Writing already requires being an admin of
-- the team, nobody is a member of this one, and it has no owner — so every
-- insert, update and delete is refused by the policies that already exist.
-- There is nothing here that could be relaxed by accident later.
--
-- Its members stay hidden. `team_members` gains no demo policy, so the list of
-- who is in it is as private as any other team's.

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Only one, so "the demo team" is a thing that can be looked up.
CREATE UNIQUE INDEX IF NOT EXISTS teams_one_demo
  ON public.teams ((is_demo)) WHERE is_demo;

-- A real team must have an owner — that is what stops one being created that
-- nobody is responsible for. The demo team is the exception, and having no
-- owner is precisely what makes it unmodifiable: the "creators can update"
-- policy compares against created_by, and nothing equals null.
ALTER TABLE public.teams ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_real_teams_have_an_owner;

ALTER TABLE public.teams
  ADD CONSTRAINT teams_real_teams_have_an_owner
  CHECK (created_by IS NOT NULL OR is_demo);

/**
 * Whether a team is the demo one.
 *
 * SECURITY DEFINER so it can answer without the caller needing to read the
 * teams table first, which is the same recursion the membership helpers avoid.
 * search_path is pinned: an open one is how a function gets pointed at
 * somebody else's table.
 */
CREATE OR REPLACE FUNCTION public.is_demo_team(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = check_team_id AND is_demo
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_demo_team(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_demo_team(uuid) TO authenticated;

DROP POLICY IF EXISTS "Anyone signed in can view the demo team" ON public.teams;
CREATE POLICY "Anyone signed in can view the demo team"
  ON public.teams FOR SELECT TO authenticated
  USING (is_demo);

DROP POLICY IF EXISTS "Anyone signed in can view demo players" ON public.players;
CREATE POLICY "Anyone signed in can view demo players"
  ON public.players FOR SELECT TO authenticated
  USING (public.is_demo_team(team_id));

DROP POLICY IF EXISTS "Anyone signed in can view demo matches" ON public.matches;
CREATE POLICY "Anyone signed in can view demo matches"
  ON public.matches FOR SELECT TO authenticated
  USING (public.is_demo_team(team_id));

DROP POLICY IF EXISTS "Anyone signed in can view demo seasons" ON public.seasons;
CREATE POLICY "Anyone signed in can view demo seasons"
  ON public.seasons FOR SELECT TO authenticated
  USING (public.is_demo_team(team_id));

-- This one compares a membership row's own id to a team id, so it matches
-- nothing and never has. The policy beside it does the real work.
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;

-- ── the squad, the seasons and a season and a half of results ──────────────

DO $seed$
DECLARE
  demo    uuid := '0d000000-0000-4000-8000-000000000001';
  spring  uuid := '0d000000-0000-4000-8000-000000000002';
  autumn  uuid := '0d000000-0000-4000-8000-000000000003';
  names   text[] := ARRAY[
    'Ade', 'Baz', 'Cal', 'Dermot', 'Eoin', 'Fitz',
    'Gaz', 'Hutch', 'Ivo', 'Jonesy', 'Kav', 'Lofty'
  ];
  ids     uuid[] := '{}';
  pid     uuid;
  i       int;
  m       int;
  side_a  uuid[];
  side_b  uuid[];
  goals_a int;
  goals_b int;
  played  date;
  season  uuid;
  result  text;
BEGIN
  -- Already seeded: leave it exactly as it is rather than doubling it.
  IF EXISTS (SELECT 1 FROM public.teams WHERE id = demo) THEN
    RETURN;
  END IF;

  INSERT INTO public.teams (id, name, created_by, side_a_name, side_b_name, is_demo)
  VALUES (demo, 'The Tuesday Game', NULL, 'Bibs', 'No bibs', true);

  FOR i IN 1 .. array_length(names, 1) LOOP
    pid := ('0d000001-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid;
    ids := ids || pid;

    INSERT INTO public.players (id, name, team_id, is_active, skill_level, created_at, updated_at)
    VALUES (
      pid,
      names[i],
      demo,
      -- Two who have stopped turning up, so the active filter has something
      -- to do.
      i < array_length(names, 1) - 1,
      1 + (i * 7) % 5,
      now(),
      now()
    );
  END LOOP;

  INSERT INTO public.seasons
    (id, name, start_date, end_date, is_current, is_finished, team_id, created_at, updated_at)
  VALUES
    (spring, 'Spring', now() - interval '30 weeks', now() - interval '16 weeks', false, true, demo, now(), now()),
    (autumn, 'Autumn', now() - interval '15 weeks', NULL, true, false, demo, now(), now());

  FOR m IN 0 .. 25 LOOP
    season := CASE WHEN m < 13 THEN spring ELSE autumn END;
    played := (now() - interval '1 week' * (26 - m))::date;

    -- Rotating the squad by the match number gives everybody a different set
    -- of team-mates over the run, which is what makes the chemistry figures
    -- worth looking at.
    side_a := ARRAY[
      ids[1 + (m * 5 + 0) % 12], ids[1 + (m * 5 + 1) % 12],
      ids[1 + (m * 5 + 2) % 12], ids[1 + (m * 5 + 3) % 12],
      ids[1 + (m * 5 + 4) % 12]
    ];
    side_b := ARRAY(
      SELECT unnest(ids) EXCEPT SELECT unnest(side_a)
    );

    -- Deterministic, and lopsided enough that the table has a shape to it.
    goals_a := (m * 3) % 6;
    goals_b := (m * 5 + 1) % 6;
    result := CASE
      WHEN goals_a > goals_b THEN 'a'
      WHEN goals_a < goals_b THEN 'b'
      ELSE 'draw'
    END;

    INSERT INTO public.matches
      (id, date, team_a, team_b, status, outcome, season_id, team_id, created_at, updated_at)
    VALUES (
      ('0d000002-0000-4000-8000-' || lpad(m::text, 12, '0'))::uuid,
      played::text,
      jsonb_build_object(
        'name', 'Bibs',
        'players', to_jsonb(side_a),
        -- Every third match goes down as a result with no score, which is the
        -- normal way of it and worth showing.
        'score', CASE WHEN m % 3 = 0 THEN NULL ELSE goals_a END
      ) - CASE WHEN m % 3 = 0 THEN 'score' ELSE '' END,
      jsonb_build_object(
        'name', 'No bibs',
        'players', to_jsonb(side_b),
        'score', CASE WHEN m % 3 = 0 THEN NULL ELSE goals_b END
      ) - CASE WHEN m % 3 = 0 THEN 'score' ELSE '' END,
      'completed',
      result,
      season,
      demo,
      now(),
      now()
    );
  END LOOP;
END
$seed$;

COMMENT ON COLUMN public.teams.is_demo IS
  'The one team every signed-in user can read and nobody can write. Owned by no one, which is what makes it immutable.';
