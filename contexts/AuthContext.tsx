"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthError, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-browser";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Client-side view of who is signed in.
 *
 * `initialUser` comes from the server layout, which has already resolved the
 * session from the request cookies. Seeding it means the first paint knows who
 * is signed in — there is no `loading` state and no spinner, because by the
 * time a page renders the proxy has already established there is a session.
 */
export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser: User | null;
}> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();
  const { toast } = useToast();

  // The listener is set up once and must not be torn down when the router
  // object changes identity — `router.refresh()` is called from inside it, and
  // a `[router]` dependency would resubscribe on every refresh, fire the
  // subscribe-time event again, and refresh again.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Supabase emits on token refresh as well as on sign-in, and every emission
  // carries a fresh `User` object. Comparing ids rather than references keeps
  // an hourly token refresh from looking like a new person and re-running
  // everything downstream that watches `user`.
  const userIdRef = useRef<string | null>(initialUser?.id ?? null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user?.id ?? null;
      if (nextId === userIdRef.current) return;

      userIdRef.current = nextId;
      setUser(session?.user ?? null);
      // Server components hold their own copy of the session and would carry
      // on rendering against the old one.
      routerRef.current.refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      toast({ title: "Signed in successfully", description: "Welcome back!" });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (!error) {
      toast({
        title: "Sign up successful",
        description: "Please check your email to confirm your account.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully", description: "See you soon!" });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
