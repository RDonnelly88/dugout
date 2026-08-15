import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Where sign-in links land. Handles both shapes Supabase can produce:
 *
 * - `?code=…` — the PKCE flow used by `signInWithOtp` from the browser, which
 *   is what the default Supabase email template produces.
 * - `?token_hash=…&type=…` — the server-verifiable form, produced by the
 *   `{{ .TokenHash }}` template. Supported so customising the email doesn't
 *   silently break sign-in.
 *
 * Both are exchanged server-side so the session cookie is set by the response.
 * The third shape — an `#access_token=…` fragment from the implicit flow — is
 * deliberately unsupported: a fragment never reaches the server, so it cannot
 * be handled here at all.
 *
 * Behind Vercel's proxy `request.url` carries the internal host, so the
 * redirect target is rebuilt from the forwarded headers.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const base = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  const toLogin = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);

  if (authError) return toLogin(authError);

  const supabase = await supabaseServer();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return toLogin(error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return toLogin(error.message);
  } else {
    return toLogin("That sign-in link was incomplete.");
  }

  // Only ever redirect within this site.
  const dest = next?.startsWith("/") ? `${base}${next}` : base;
  return NextResponse.redirect(dest);
}
