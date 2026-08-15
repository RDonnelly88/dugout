"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { isThemeChoice, type ThemeChoice } from "@/lib/theme";

/**
 * Store the account's theme.
 *
 * A server action is a public endpoint, so the value is validated here rather
 * than trusted from the caller — TypeScript types are erased and say nothing
 * at runtime. The row is keyed on the session's own user id, never on anything
 * the request supplied.
 */
export async function saveThemePreference(choice: ThemeChoice) {
  if (!isThemeChoice(choice)) return;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_settings")
    .upsert(
      { user_id: user.id, theme: choice, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
}
