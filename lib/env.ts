import { z } from "zod";

/**
 * Validated environment access. Importing `env` anywhere guarantees the vars
 * exist and are well-formed — a missing or malformed value fails the build
 * with a readable message instead of surfacing as a runtime `undefined`.
 *
 * Both vars are `NEXT_PUBLIC_*`, meaning they are inlined into the client
 * bundle and are **not secrets**. That is by design: the anon key is intended
 * to be public, and row-level security is what actually protects the data.
 * Never add a service-role key here — it would ship to the browser.
 *
 * Next.js only inlines `process.env.NEXT_PUBLIC_X` when written as a literal
 * member expression, so each one is destructured explicitly below rather than
 * looped over.
 */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(
    "NEXT_PUBLIC_SUPABASE_URL must be a full URL, e.g. https://abc.supabase.co"
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment configuration:\n${detail}\n\n` +
      `Copy .env.local.example to .env.local and fill in your Supabase values, ` +
      `or run \`vercel env pull .env.local\` if the project is linked.`
  );
}

export const env = parsed.data;
