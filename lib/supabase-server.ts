import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "./env";
import type { Database } from "./database.types";

/**
 * Request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers. `cookies()` is async as of Next 15, so every call site must
 * await this.
 *
 * Importing this module pulls in `next/headers`, which cannot be reached from
 * a client component. Anything calling it must be rendered in a page or action
 * and its result passed down as a prop.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          try {
            all.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies. Safe to swallow: the
            // middleware refreshes the session on every request instead.
          }
        },
      },
    }
  );
}
