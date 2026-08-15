-- Retire the cached tally now that nothing reads it.
--
-- `players.stats` held played/won/lost/drawn as jsonb, recomputed by the
-- client after each result. It is the reason a player card could show "No
-- matches played" above a season row of twelve: two places holding the same
-- fact, only one of them derived.
--
-- Dropping rather than leaving it: an unused column that looks authoritative
-- is an invitation to read it again, and everything it held is recoverable
-- from `player_stats` at any time, because that view counts the matches
-- themselves.

ALTER TABLE "public"."players" DROP COLUMN IF EXISTS "stats";
