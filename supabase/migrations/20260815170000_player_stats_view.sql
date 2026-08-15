-- One place the app can ask what a player's record is.
--
-- Until now there were two. `season_player_stats` derives the figures from
-- matches; `players.stats` was a jsonb cache that client code rewrote after
-- every result. They disagreed — a player card showed "No matches played" and
-- "12 Played" side by side — because the cache is only as good as the last
-- write that remembered to update it, and nothing ever recomputed it.
--
-- This view is the same arithmetic as season_player_stats with the season
-- dropped, so all-time and per-season answers can never diverge. The jsonb
-- column goes in the migration that follows once nothing reads it.
--
-- A LEFT JOIN rather than an inner one: a player who has yet to turn out is a
-- real player with a record of zero, not an absent row for the UI to guess at.

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
      -- A completed match with no score on it isn't a result yet.
      AND (m.team_a ->> 'score') IS NOT NULL
      AND (m.team_b ->> 'score') IS NOT NULL
LEFT JOIN LATERAL (
  SELECT
    jsonb_exists(m.team_a -> 'players', p.id::text)     AS in_a,
    (m.team_a ->> 'score')::int                         AS goals_a,
    (m.team_b ->> 'score')::int                         AS goals_b
) s ON true
LEFT JOIN LATERAL (
  SELECT
    s.goals_a = s.goals_b                                            AS drawn,
    (s.in_a AND s.goals_a > s.goals_b)
      OR (NOT s.in_a AND s.goals_b > s.goals_a)                      AS won,
    (s.in_a AND s.goals_a < s.goals_b)
      OR (NOT s.in_a AND s.goals_b < s.goals_a)                      AS lost
) f ON true
GROUP BY p.team_id, p.id, p.name, p.image, p.is_active;

ALTER VIEW "public"."player_stats" SET (security_invoker = on);

GRANT SELECT ON TABLE "public"."player_stats" TO "authenticated";
