"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { Toaster } from "@/components/ui/toaster";

/**
 * The client-side provider stack, mounted once in the root layout.
 *
 * The QueryClient is created in state rather than at module scope: a module
 * singleton is shared across every request on the server, which would leak one
 * user's cached rows into another's render.
 */
export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        <TeamProvider>
          {children}
          <Toaster />
        </TeamProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
