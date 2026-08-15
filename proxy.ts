import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/** The only paths reachable without a session. Everything else redirects. */
const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
* Refreshes the Supabase session on every request and gates the private routes.
 *
 * Next 16 renamed the `middleware` file convention to `proxy`, with a default
 * export in place of a named `middleware` function.
 *
 * Server Components can read cookies but can't write them, so without this the
 * access token would expire and never be renewed — the user would be silently
 * signed out mid-session. The refreshed cookies have to be written onto the
 * response that is actually returned, which is why `response` is created up
 * front and `setAll` writes to both the request (for anything downstream in
 * this same pass) and the response.
 *
 * Gating here rather than in a wrapper component means an unauthenticated
 * request never reaches the page at all, so there is no flash of a loading
 * spinner before the redirect.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          all.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // `getUser()` rather than `getSession()`: it revalidates the token against
  // the auth server. `getSession()` trusts whatever is in the cookie, which is
  // attacker-controlled and so can't gate anything.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Carry the destination so the login form can return the user to it.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next's own assets and files with an extension. The
    // sound effects and images in public/ are served without a session check.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|txt)$).*)",
  ],
};
