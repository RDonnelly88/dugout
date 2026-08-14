import { createBrowserClient } from "@supabase/ssr";
import { env } from "./env";
import type { Database } from "./database.types";

/**
 * Browser Supabase client, typed from the generated schema so query results
 * carry real column types. Regenerate `database.types.ts` after every
 * migration — `npm run types:db`.
 *
 * One instance for the whole app: `createBrowserClient` stores the session in
 * cookies, and two clients would each hold their own refresh timer against the
 * same session.
 */
export const supabase = createBrowserClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
