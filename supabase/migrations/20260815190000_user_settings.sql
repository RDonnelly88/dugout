-- Per-account preferences.
--
-- Theme lives here rather than only in localStorage so the choice follows the
-- account to a phone, and survives Safari clearing script-writable storage.
-- localStorage is still written alongside it, because it is the only copy
-- available before the first byte of HTML and signed out.
--
-- Keyed on the user rather than carrying its own id: there is exactly one row
-- per account, and a surrogate key would only make it possible to have two.

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
  "user_id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "theme" text NOT NULL DEFAULT 'system' CHECK ("theme" IN ('light', 'dark', 'system')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

-- A GRANT and a policy are independent gates: the grant alone returns
-- permission denied, the policy alone returns nothing.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_settings" TO "authenticated";

CREATE POLICY "Users read their own settings" ON "public"."user_settings"
  FOR SELECT TO "authenticated" USING ("user_id" = auth.uid());

CREATE POLICY "Users write their own settings" ON "public"."user_settings"
  FOR INSERT TO "authenticated" WITH CHECK ("user_id" = auth.uid());

CREATE POLICY "Users update their own settings" ON "public"."user_settings"
  FOR UPDATE TO "authenticated" USING ("user_id" = auth.uid());
