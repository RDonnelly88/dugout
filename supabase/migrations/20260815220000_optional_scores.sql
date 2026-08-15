-- Make the score optional, and the outcome explicit.
--
-- Who won was inferred by comparing the two scores, so a result could only be
-- recorded by someone who remembered it 6–4 rather than "we won". Five-a-side
-- is mostly the latter. `outcome` is now the truth about who won, and the
-- score is detail on top of it: worth having when it is known, because the
-- rating model weights a thrashing above a scrape, and absent otherwise.
--
-- The two cannot contradict each other. A constraint holds the score to the
-- outcome whenever both are present, so there is no second version of who won
-- waiting to disagree.

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS outcome text;

ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_outcome_valid;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_outcome_valid
  CHECK (outcome IS NULL OR outcome IN ('a', 'b', 'draw'));

-- Every match played so far has a score, so its outcome follows from it.
UPDATE public.matches
SET outcome = CASE
    WHEN (team_a ->> 'score')::int > (team_b ->> 'score')::int THEN 'a'
    WHEN (team_a ->> 'score')::int < (team_b ->> 'score')::int THEN 'b'
    ELSE 'draw'
  END
WHERE outcome IS NULL
  AND status = 'completed'
  AND (team_a ->> 'score') IS NOT NULL
  AND (team_b ->> 'score') IS NOT NULL;

ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_score_agrees_with_outcome;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_score_agrees_with_outcome
  CHECK (
    outcome IS NULL
    OR (team_a ->> 'score') IS NULL
    OR (team_b ->> 'score') IS NULL
    OR outcome = CASE
        WHEN (team_a ->> 'score')::int > (team_b ->> 'score')::int THEN 'a'
        WHEN (team_a ->> 'score')::int < (team_b ->> 'score')::int THEN 'b'
        ELSE 'draw'
      END
  );

COMMENT ON COLUMN public.matches.outcome IS
  'Who won: a, b or draw. The truth about the result. Null until it is played. The score, when present, must agree.';

-- ── the two tables of record ──────────────────────────────────────────────
--
-- Both now count a match as played once it has an outcome, rather than once it
-- has two scores.

CREATE OR REPLACE VIEW "public"."player_stats" AS
SELECT
  p.team_id,
  p.id                                          AS player_id,
  p.name                                        AS player_name,
  p.image                                       AS player_image,
  p.is_active,
  count(m.id)                                   AS played,
  count(m.id) FILTER (WHERE f.won)              AS wins,
  count(m.id) FILTER (WHERE f.drawn)            AS draws,
  count(m.id) FILTER (WHERE f.lost)             AS losses,
  3 * count(m.id) FILTER (WHERE f.won)
    + count(m.id) FILTER (WHERE f.drawn)        AS points
FROM public.players p
LEFT JOIN public.matches m
       ON m.team_id = p.team_id
      AND m.status = 'completed'
      -- jsonb_exists rather than the `?` operator: identical meaning, but `?`
      -- is a parameter placeholder to several drivers and this file is read by
      -- more than psql.
      AND (jsonb_exists(m.team_a -> 'players', p.id::text)
        OR jsonb_exists(m.team_b -> 'players', p.id::text))
      -- A completed match nobody has said the result of isn't a result yet.
      AND m.outcome IS NOT NULL
LEFT JOIN LATERAL (
  SELECT jsonb_exists(m.team_a -> 'players', p.id::text) AS in_a
) s ON true
LEFT JOIN LATERAL (
  SELECT
    m.outcome = 'draw'                                               AS drawn,
    (s.in_a AND m.outcome = 'a') OR (NOT s.in_a AND m.outcome = 'b') AS won,
    (s.in_a AND m.outcome = 'b') OR (NOT s.in_a AND m.outcome = 'a') AS lost
) f ON true
GROUP BY p.team_id, p.id, p.name, p.image, p.is_active;

ALTER VIEW "public"."player_stats" SET (security_invoker = on);
GRANT SELECT ON TABLE "public"."player_stats" TO "authenticated";

-- The season version was a cross join of every season against every player,
-- so it returned a row for everybody whether or not they had played a minute
-- of it — which is why the players page could report twelve people had
-- featured in a season that four of them sat out. Same arithmetic as above,
-- with the season kept, and only the people who actually turned up.
CREATE OR REPLACE VIEW "public"."season_player_stats" AS
SELECT
  se.id                                         AS season_id,
  se.name                                       AS season_name,
  p.id                                          AS player_id,
  p.name                                        AS player_name,
  p.image                                       AS player_image,
  count(m.id) FILTER (WHERE f.won)              AS wins,
  count(m.id) FILTER (WHERE f.lost)             AS losses,
  count(m.id) FILTER (WHERE f.drawn)            AS draws,
  count(m.id)                                   AS played,
  3 * count(m.id) FILTER (WHERE f.won)
    + count(m.id) FILTER (WHERE f.drawn)        AS points
FROM public.seasons se
JOIN public.matches m
       ON m.season_id = se.id
      AND m.status = 'completed'
      AND m.outcome IS NOT NULL
JOIN public.players p
       ON p.team_id = se.team_id
      AND (jsonb_exists(m.team_a -> 'players', p.id::text)
        OR jsonb_exists(m.team_b -> 'players', p.id::text))
LEFT JOIN LATERAL (
  SELECT jsonb_exists(m.team_a -> 'players', p.id::text) AS in_a
) s ON true
LEFT JOIN LATERAL (
  SELECT
    m.outcome = 'draw'                                               AS drawn,
    (s.in_a AND m.outcome = 'a') OR (NOT s.in_a AND m.outcome = 'b') AS won,
    (s.in_a AND m.outcome = 'b') OR (NOT s.in_a AND m.outcome = 'a') AS lost
) f ON true
GROUP BY se.id, se.name, p.id, p.name, p.image;

ALTER VIEW "public"."season_player_stats" SET (security_invoker = on);
GRANT SELECT ON TABLE "public"."season_player_stats" TO "authenticated";
