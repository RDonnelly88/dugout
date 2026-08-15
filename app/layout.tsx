import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import { getThemePreference } from "@/lib/theme-server";
import { themeInitScript } from "@/lib/theme";
import { Providers } from "@/components/providers";
import "./globals.css";

// Self-hosted at build time by next/font — no runtime request to Google, no
// render-blocking @import, and no third party learning a visitor's IP.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Dugout",
  description: "Five-a-side results, player form and season standings.",
};

export const viewport: Viewport = {
  // Matches the page behind the status bar in each theme, so the browser
  // chrome doesn't clash with the app on a phone.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070b12" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Both resolved server-side so the first paint knows who is signed in and
  // which theme they chose. `getUser()` revalidates against the auth server;
  // `getSession()` only reads the cookie and can't be trusted.
  const supabase = await supabaseServer();
  const [{ data: { user } }, theme] = await Promise.all([
    supabase.auth.getUser(),
    getThemePreference(),
  ]);

  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${plexMono.variable}`}
      // 'system' means follow the OS, which is the absence of an override.
      data-theme={theme === "light" || theme === "dark" ? theme : undefined}
      suppressHydrationWarning
    >
      <head>
        {/* Must run before paint — see themeInitScript. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
