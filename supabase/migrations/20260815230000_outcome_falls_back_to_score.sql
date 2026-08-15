-- Let the tables of record fall back to the score, as the app does.
--
-- The previous migration made both views count a match only once `outcome` was
-- set. Anything writing a match without it — the local seed, an import, a
-- client running older code — produced a completed match with a score on it
-- that counted towards nobody's record, and a league table that silently
-- dropped rows rather than failing.
--
-- `lib/match-result.ts` reads a missing outcome by comparing the scores. These
-- now do the same, so the two cannot disagree about whether a match happened.

CREATE OR REPLACE FUNCTION public.match_outcome(
  outcome text,
  team_a jsonb,
  team_b jsonb
) RETURNS text
LANGUAGE sql
IMMUTABLE
-- No table access, but pinned regardless: a search_path left open is how a
-- function gets pointed at somebody else's operators.
SET search_path = ''
AS $$
  SELECT CASE
    WHEN outcome IS NOT NULL THEN outcome
    WHEN (team_a ->> 'score') IS NULL OR (team_b ->> 'score') IS NULL THEN NULL
    WHEN (team_a ->> 'score')::int > (team_b ->> 'score')::int THEN 'a'
    WHEN (team_a ->> 'score')::int < (team_b ->> 'score')::int THEN 'b'
    ELSE 'draw'
  END
$$;

COMMENT ON FUNCTION public.match_outcome(text, jsonb, jsonb) IS
  'Who won: the stored outcome, or the score compared when none was stored.';

GRANT EXECUTE ON FUNCTION public.match_outcome(text, jsonb, jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.match_outcome(text, jsonb, jsonb) FROM anon;

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
      AND (jsonb_exists(m.team_a -> 'players', p.id::text)
        OR jsonb_exists(m.team_b -> 'players', p.id::text))
      AND public.match_outcome(m.outcome, m.team_a, m.team_b) IS NOT NULL
LEFT JOIN LATERAL (
  SELECT
    jsonb_exists(m.team_a -> 'players', p.id::text)          AS in_a,
    public.match_outcome(m.outcome, m.team_a, m.team_b)      AS result
) s ON true
LEFT JOIN LATERAL (
  SELECT
    s.result = 'draw'                                                AS drawn,
    (s.in_a AND s.result = 'a') OR (NOT s.in_a AND s.result = 'b')   AS won,
    (s.in_a AND s.result = 'b') OR (NOT s.in_a AND s.result = 'a')   AS lost
) f ON true
GROUP BY p.team_id, p.id, p.name, p.image, p.is_active;

ALTER VIEW "public"."player_stats" SET (security_invoker = on);
GRANT SELECT ON TABLE "public"."player_stats" TO "authenticated";

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
      AND public.match_outcome(m.outcome, m.team_a, m.team_b) IS NOT NULL
JOIN public.players p
       ON p.team_id = se.team_id
      AND (jsonb_exists(m.team_a -> 'players', p.id::text)
        OR jsonb_exists(m.team_b -> 'players', p.id::text))
LEFT JOIN LATERAL (
  SELECT
    jsonb_exists(m.team_a -> 'players', p.id::text)          AS in_a,
    public.match_outcome(m.outcome, m.team_a, m.team_b)      AS result
) s ON true
LEFT JOIN LATERAL (
  SELECT
    s.result = 'draw'                                                AS drawn,
    (s.in_a AND s.result = 'a') OR (NOT s.in_a AND s.result = 'b')   AS won,
    (s.in_a AND s.result = 'b') OR (NOT s.in_a AND s.result = 'a')   AS lost
) f ON true
GROUP BY se.id, se.name, p.id, p.name, p.image;

ALTER VIEW "public"."season_player_stats" SET (security_invoker = on);
GRANT SELECT ON TABLE "public"."season_player_stats" TO "authenticated";
