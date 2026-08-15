-- Make the champion agree with the leaderboard.
--
-- `calculatePlayerRanks` orders on points, then games played, then wins, and
-- gives players with identical records the same rank. This view ordered on
-- points then wins, ignoring games played, and numbered every row separately.
-- So the two could disagree about who finished second, and only one of them
-- could be right.
--
-- Two changes, one for each disagreement:
--
--   `played DESC` joins the ordering. Turning out more often breaks a tie in
--   your favour, which is the rule the table has always applied and the one
--   written down in the README.
--
--   `rank()` replaces `row_number()`. row_number() numbers rows, so two players
--   with identical records got 2nd and 3rd in whatever order the planner
--   happened to return them. rank() is the golf-style ranking the app does:
--   equal records share a place and the next player takes the one their count
--   implies, so two tied in second are followed by a fourth.
--
-- security_invoker is restated because CREATE OR REPLACE VIEW rewrites the
-- definition, and losing it here would quietly reopen the hole the earlier
-- migration closed.

CREATE OR REPLACE VIEW "public"."season_champions" AS
 SELECT "s"."id" AS "season_id",
    "s"."name" AS "season_name",
    "sps"."player_id",
    "sps"."player_name",
    "sps"."player_image",
    "sps"."points",
    "sps"."wins",
    "sps"."draws",
    "sps"."losses",
    "sps"."played",
    "rank"() OVER (
      PARTITION BY "s"."id"
      ORDER BY "sps"."points" DESC, "sps"."played" DESC, "sps"."wins" DESC
    ) AS "rank"
   FROM ("public"."seasons" "s"
     JOIN "public"."season_player_stats" "sps" ON (("s"."id" = "sps"."season_id")))
  WHERE ("sps"."played" > 0)
  ORDER BY "s"."name", (
    "rank"() OVER (
      PARTITION BY "s"."id"
      ORDER BY "sps"."points" DESC, "sps"."played" DESC, "sps"."wins" DESC
    )
  );

ALTER VIEW "public"."season_champions" SET (security_invoker = on);
