-- Every row belongs to a team, and the policies stop pretending otherwise.
--
-- All six policies on matches, players and seasons began `team_id IS NULL OR
-- …`, which made any row without an owner readable and writable by every
-- signed-in account regardless of which team they were in. That branch dates
-- from before teams existed.
--
-- Checked against the hosted data first: no row in any of the three tables has
-- a null team_id, so nothing is hidden by this.
--
-- The NOT NULL constraints go on before the policies are narrowed, and they are
-- the point rather than a tidy-up. Narrowing the policies alone would turn an
-- ownerless row from visible-to-everyone into visible-to-nobody, which looks
-- like data loss and gives no clue why. With the constraint, whatever tried to
-- write it fails at the insert instead. Every path that creates one of these
-- rows already passes the current team, so nothing is expected to hit it.

ALTER TABLE "public"."matches" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "public"."players" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "public"."seasons" ALTER COLUMN "team_id" SET NOT NULL;

DROP POLICY IF EXISTS "Team admins can manage matches" ON "public"."matches";
CREATE POLICY "Team admins can manage matches" ON "public"."matches"
  TO "authenticated" USING ("public"."is_team_admin"("team_id"));

DROP POLICY IF EXISTS "Team members can view matches" ON "public"."matches";
CREATE POLICY "Team members can view matches" ON "public"."matches"
  FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));

DROP POLICY IF EXISTS "Team admins can manage players" ON "public"."players";
CREATE POLICY "Team admins can manage players" ON "public"."players"
  TO "authenticated" USING ("public"."is_team_admin"("team_id"));

DROP POLICY IF EXISTS "Team members can view players" ON "public"."players";
CREATE POLICY "Team members can view players" ON "public"."players"
  FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));

DROP POLICY IF EXISTS "Team admins can manage seasons" ON "public"."seasons";
CREATE POLICY "Team admins can manage seasons" ON "public"."seasons"
  TO "authenticated" USING ("public"."is_team_admin"("team_id"));

DROP POLICY IF EXISTS "Team members can view seasons" ON "public"."seasons";
CREATE POLICY "Team members can view seasons" ON "public"."seasons"
  FOR SELECT TO "authenticated" USING ("public"."is_team_member"("team_id"));
