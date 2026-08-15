"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Fingerprint, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-browser";
import { passkeyErrorMessage, supportsWebAuthn } from "@/lib/passkeys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emailSchema = z.email("Enter a valid email address");

const LoginForm = () => {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  // The proxy puts the blocked path here when it turns away an unauthenticated
  // request, so signing in returns you where you were going.
  const next = params.get("next") ?? "/";

  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  // An error handed back by /auth/callback — an expired or already-used link.
  const [error, setError] = useState<string | null>(params.get("error"));

  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [linkPending, setLinkPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);
  // Resolved in an effect rather than during render: the server has no
  // `window`, so an inline test would render one way on the server and the
  // other on the client.
  const [hasWebAuthn, setHasWebAuthn] = useState(false);

  useEffect(() => setHasWebAuthn(supportsWebAuthn()), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setError(error.message);
      } else {
        router.replace(next);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(signupEmail, signupPassword);
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);

    const parsed = emailSchema.safeParse(loginEmail.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLinkPending(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: {
        // `next` rides along so the link lands where the password form would.
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // Without this the client asks the server to create an account for an
        // unrecognised address. Keeping it explicit puts the intent at the call
        // site rather than only in the project's config.
        shouldCreateUser: false,
      },
    });
    setLinkPending(false);

    if (authError) setError(authError.message);
    else setLinkSentTo(parsed.data);
  };

  const handlePasskey = async () => {
    setError(null);
    setPasskeyPending(true);
    const { data, error: authError } = await supabase.auth.signInWithPasskey();
    setPasskeyPending(false);

    // Every failure leaves the password form standing and says why. A dismissed
    // prompt is the ordinary outcome, not a dead end.
    if (authError) {
      setError(passkeyErrorMessage(authError, "sign-in"));
      return;
    }
    if (!data?.session) {
      setError("That passkey didn't start a session. Use your password instead.");
      return;
    }

    // No callback round-trip: the browser client has already written the
    // session cookie, so the server only needs to render against it.
    router.replace(next);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && (
                    <p
                      role="alert"
                      className="p-3 bg-loss/10 border border-red-500/20 rounded-md text-loss text-sm"
                    >
                      {error}
                    </p>
                  )}
                  {linkSentTo && (
                    <output className="block p-3 bg-accent/10 border border-accent/20 rounded-md text-accent text-sm">
                      Link sent to {linkSentTo}. It works once and expires
                      shortly.
                    </output>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="flex items-center gap-3 w-full text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  {/* Sends to whatever is in the email field above, so there is
                      one place to type an address rather than two. */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleMagicLink}
                    disabled={linkPending}
                  >
                    {linkPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" aria-hidden />
                        Email me a sign-in link
                      </>
                    )}
                  </Button>

                  {/* Offered only where a ceremony can actually run. A browser
                      without WebAuthn gets the form alone rather than a button
                      that opens nothing. */}
                  {hasWebAuthn && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handlePasskey}
                      disabled={passkeyPending}
                    >
                      {passkeyPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                          Waiting for your device…
                        </>
                      ) : (
                        <>
                          <Fingerprint className="h-4 w-4 mr-2" aria-hidden />
                          Use a passkey
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to get started
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  {error && (
                    <p
                      role="alert"
                      className="p-3 bg-loss/10 border border-red-500/20 rounded-md text-loss text-sm"
                    >
                      {error}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginForm;
