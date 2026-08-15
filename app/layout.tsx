import type { Metadata, Viewport } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Dugout",
  description: "Five-a-side results, player form and season standings.",
};

export const viewport: Viewport = {
  themeColor: "#050b1a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved here rather than in the client provider so the first paint already
  // knows who is signed in. `getUser()` revalidates against the auth server;
  // `getSession()` only reads the cookie and can't be trusted.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en-GB">
      <body className="min-h-screen antialiased">
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
