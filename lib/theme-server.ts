import "server-only";

import { cookies } from "next/headers";

import { supabaseServer } from "./supabase-server";
import { isThemeChoice, type ThemeChoice } from "./theme";

/**
 * The signed-in account's stored theme, or null when signed out or unset.
 *
 * Runs in the root layout on every request. Any failure — no session, no
 * settings row, database unreachable — resolves to null and the UI falls back
 * to the operating system's preference. A colour scheme is never worth failing
 * a page render over.
 */
export async function getThemePreference(): Promise<ThemeChoice | null> {
  try {
    // No auth cookie means no session, so skip the round trip entirely.
    // /login would otherwise pay for a lookup that can only return null.
    const store = await cookies();
    const hasSession = store
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
    if (!hasSession) return null;

    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("user_settings")
      .select("theme")
      .eq("user_id", user.id)
      .maybeSingle();

    return isThemeChoice(data?.theme) ? data.theme : null;
  } catch {
    return null;
  }
}
