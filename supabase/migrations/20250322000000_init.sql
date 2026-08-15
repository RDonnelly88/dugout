-- The schema as it stands in the hosted project, captured with
-- `supabase db dump --schema public`.
--
-- The app was built in Lovable, which applied its changes straight to the
-- hosted database, so nothing before this point was ever written down. This
-- file is that history collapsed into one starting point: it already includes
-- the two changes that did have migration files (players.is_active,
-- matches.notes), which is why those files are gone.
--
-- Never edit an applied migration. Add a new one.



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."team_role" AS ENUM (
    'admin',
    'viewer'
);


ALTER TYPE "public"."team_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_team_id UUID;
  result JSON;
BEGIN
  -- Create the team
  INSERT INTO public.teams (name, created_by, created_at, updated_at)
  VALUES (team_name, user_id, now(), now())
  RETURNING id INTO new_team_id;
  
  -- Add the creator as an admin
  INSERT INTO public.team_members (team_id, user_id, role, created_at)
  VALUES (new_team_id, user_id, 'admin', now());
  
  -- Return the team ID
  SELECT json_build_object(
    'team_id', new_team_id
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_members"("team_id_param" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "team_id" "uuid", "role" "text", "created_at" timestamp with time zone, "username" "text", "avatar_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    team_members tm
    LEFT JOIN profiles p ON tm.user_id = p.id
  WHERE 
    tm.team_id = team_id_param;
END;
$$;


ALTER FUNCTION "public"."get_team_members"("team_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_admin"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."is_team_admin"("team_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_member"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_team_member"("team_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_current_season"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE public.seasons SET is_current = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_current_season"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "text" NOT NULL,
    "location" "text",
    "team_a" "jsonb" NOT NULL,
    "team_b" "jsonb" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "season_id" "uuid",
    "team_id" "uuid",
    "notes" "text",
    CONSTRAINT "matches_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "image" "text",
    "stats" "jsonb" DEFAULT '{"won": 0, "lost": 0, "drawn": 0, "played": 0}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."player_match_results" AS
 WITH "match_results" AS (
         SELECT "m"."id" AS "match_id",
            "m"."date",
            "m"."season_id",
            "p"."id" AS "player_id",
                CASE
                    WHEN ((("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_a" -> 'players'::"text")) AS "jsonb_array_elements_text"))) AND ((("m"."team_a" ->> 'score'::"text"))::integer > (("m"."team_b" ->> 'score'::"text"))::integer)) THEN 'win'::"text"
                    WHEN ((("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_b" -> 'players'::"text")) AS "jsonb_array_elements_text"))) AND ((("m"."team_b" ->> 'score'::"text"))::integer > (("m"."team_a" ->> 'score'::"text"))::integer)) THEN 'win'::"text"
                    WHEN ((("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_a" -> 'players'::"text")) AS "jsonb_array_elements_text"))) AND ((("m"."team_a" ->> 'score'::"text"))::integer < (("m"."team_b" ->> 'score'::"text"))::integer)) THEN 'loss'::"text"
                    WHEN ((("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_b" -> 'players'::"text")) AS "jsonb_array_elements_text"))) AND ((("m"."team_b" ->> 'score'::"text"))::integer < (("m"."team_a" ->> 'score'::"text"))::integer)) THEN 'loss'::"text"
                    WHEN ((("m"."team_a" ->> 'score'::"text"))::integer = (("m"."team_b" ->> 'score'::"text"))::integer) THEN 'draw'::"text"
                    ELSE NULL::"text"
                END AS "result"
           FROM ("public"."matches" "m"
             CROSS JOIN "public"."players" "p")
          WHERE (("m"."status" = 'completed'::"text") AND ((("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_a" -> 'players'::"text")) AS "jsonb_array_elements_text"))) OR (("p"."id")::"text" = ANY (ARRAY( SELECT "jsonb_array_elements_text"(("m"."team_b" -> 'players'::"text")) AS "jsonb_array_elements_text")))))
        )
 SELECT "match_results"."match_id",
    "match_results"."date",
    "match_results"."season_id",
    "match_results"."player_id",
    "match_results"."result"
   FROM "match_results"
  WHERE ("match_results"."result" IS NOT NULL)
  ORDER BY "match_results"."date" DESC;


ALTER TABLE "public"."player_match_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "is_current" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_finished" boolean DEFAULT false,
    "team_id" "uuid"
);


ALTER TABLE "public"."seasons" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."season_player_stats" AS
 WITH "player_matches" AS (
         SELECT "s"."id" AS "season_id",
            "s"."name" AS "season_name",
            "p"."id" AS "player_id",
            "p"."name" AS "player_name",
            "p"."image" AS "player_image",
            "m"."id" AS "match_id",
            ("m"."team_a" -> 'players'::"text") AS "team_a_players",
            ("m"."team_b" -> 'players'::"text") AS "team_b_players",
            (("m"."team_a" ->> 'score'::"text"))::integer AS "team_a_score",
            (("m"."team_b" ->> 'score'::"text"))::integer AS "team_b_score",
            "m"."status"
           FROM (("public"."seasons" "s"
             CROSS JOIN "public"."players" "p")
             LEFT JOIN "public"."matches" "m" ON (("m"."season_id" = "s"."id")))
        )
 SELECT "player_matches"."season_id",
    "player_matches"."season_name",
    "player_matches"."player_id",
    "player_matches"."player_name",
    "player_matches"."player_image",
    "count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_a_score" > "player_matches"."team_b_score")) OR ((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_b_score" > "player_matches"."team_a_score"))))) AS "wins",
    "count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_a_score" < "player_matches"."team_b_score")) OR ((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_b_score" < "player_matches"."team_a_score"))))) AS "losses",
    "count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text"
        UNION
         SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_a_score" = "player_matches"."team_b_score"))) AS "draws",
    "count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text"
        UNION
         SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")))) AS "played",
    (("count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_a_score" > "player_matches"."team_b_score")) OR ((("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_b_score" > "player_matches"."team_a_score"))))) * 3) + "count"(DISTINCT "player_matches"."match_id") FILTER (WHERE (("player_matches"."status" = 'completed'::"text") AND (("player_matches"."player_id")::"text" IN ( SELECT "jsonb_array_elements_text"("player_matches"."team_a_players") AS "jsonb_array_elements_text"
        UNION
         SELECT "jsonb_array_elements_text"("player_matches"."team_b_players") AS "jsonb_array_elements_text")) AND ("player_matches"."team_a_score" = "player_matches"."team_b_score")))) AS "points"
   FROM "player_matches"
  GROUP BY "player_matches"."season_id", "player_matches"."season_name", "player_matches"."player_id", "player_matches"."player_name", "player_matches"."player_image";


ALTER TABLE "public"."season_player_stats" OWNER TO "postgres";


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
    "row_number"() OVER (PARTITION BY "s"."id" ORDER BY "sps"."points" DESC, "sps"."wins" DESC) AS "rank"
   FROM ("public"."seasons" "s"
     JOIN "public"."season_player_stats" "sps" ON (("s"."id" = "sps"."season_id")))
  WHERE ("sps"."played" > 0)
  ORDER BY "s"."name", ("row_number"() OVER (PARTITION BY "s"."id" ORDER BY "sps"."points" DESC, "sps"."wins" DESC));


ALTER TABLE "public"."season_champions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."team_role" DEFAULT 'viewer'::"public"."team_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_matches_team_id" ON "public"."matches" USING "btree" ("team_id");



CREATE INDEX "idx_players_team_id" ON "public"."players" USING "btree" ("team_id");



CREATE INDEX "idx_seasons_team_id" ON "public"."seasons" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "ensure_single_current_season" BEFORE INSERT OR UPDATE ON "public"."seasons" FOR EACH ROW WHEN (("new"."is_current" = true)) EXECUTE FUNCTION "public"."set_current_season"();



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow public access to matches" ON "public"."matches" USING (true);



CREATE POLICY "Allow public access to players" ON "public"."players" USING (true);



CREATE POLICY "Anyone can create teams" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Team admins can add members" ON "public"."team_members" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_team_admin_no_recursion"("team_id", "auth"."uid"())));



CREATE POLICY "Team admins can delete members" ON "public"."team_members" FOR DELETE TO "authenticated" USING (("public"."is_team_admin_no_recursion"("team_id", "auth"."uid"()) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Team admins can delete teams" ON "public"."teams" FOR DELETE TO "authenticated" USING ("public"."is_team_admin"("id"));



CREATE POLICY "Team admins can manage matches" ON "public"."matches" TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_admin"("team_id")));



CREATE POLICY "Team admins can manage players" ON "public"."players" TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_admin"("team_id")));



CREATE POLICY "Team admins can manage seasons" ON "public"."seasons" TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_admin"("team_id")));



CREATE POLICY "Team admins can manage team members" ON "public"."team_members" TO "authenticated" USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "Team admins can update members" ON "public"."team_members" FOR UPDATE TO "authenticated" USING ("public"."is_team_admin_no_recursion"("team_id", "auth"."uid"()));



CREATE POLICY "Team creators can delete their teams" ON "public"."teams" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Team creators can insert teams" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Team creators can update their teams" ON "public"."teams" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Team members can view matches" ON "public"."matches" FOR SELECT TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_member"("team_id")));



CREATE POLICY "Team members can view members" ON "public"."team_members" FOR SELECT TO "authenticated" USING ("public"."is_team_member_no_recursion"("team_id", "auth"."uid"()));



CREATE POLICY "Team members can view players" ON "public"."players" FOR SELECT TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_member"("team_id")));



CREATE POLICY "Team members can view seasons" ON "public"."seasons" FOR SELECT TO "authenticated" USING ((("team_id" IS NULL) OR "public"."is_team_member"("team_id")));



CREATE POLICY "Team members can view their teams" ON "public"."teams" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "teams"."id") AND ("team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view teams they are members of" ON "public"."teams" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "team_members"."id") AND ("team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their team memberships" ON "public"."team_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_with_admin"("team_name" "text", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_members"("team_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_members"("team_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_members"("team_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_admin"("team_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_admin"("team_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_admin"("team_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_admin_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_member"("team_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_member"("team_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_member"("team_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_member_no_recursion"("team_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_current_season"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_current_season"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_current_season"() TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."player_match_results" TO "anon";
GRANT ALL ON TABLE "public"."player_match_results" TO "authenticated";
GRANT ALL ON TABLE "public"."player_match_results" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."seasons" TO "anon";
GRANT ALL ON TABLE "public"."seasons" TO "authenticated";
GRANT ALL ON TABLE "public"."seasons" TO "service_role";



GRANT ALL ON TABLE "public"."season_player_stats" TO "anon";
GRANT ALL ON TABLE "public"."season_player_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."season_player_stats" TO "service_role";



GRANT ALL ON TABLE "public"."season_champions" TO "anon";
GRANT ALL ON TABLE "public"."season_champions" TO "authenticated";
GRANT ALL ON TABLE "public"."season_champions" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






