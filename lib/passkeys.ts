/**
 * Shared bits of the passkey flow, used by both the sign-in form and the
 * enrolment section in settings.
 *
 * The ceremony itself lives in supabase-js: `signInWithPasskey()` and
 * `registerPasskey()` each run the full `navigator.credentials` exchange. What
 * is left over is deciding whether to offer the option at all, and turning the
 * result into something a person can act on.
 */

/**
 * Whether this browser can run a WebAuthn ceremony.
 *
 * Call this from an effect, not during render: `window` doesn't exist on the
 * server, so the markup would claim no support and the client would then
 * disagree on first paint.
 */
export function supportsWebAuthn(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential === "function"
  );
}

/**
 * Wording for a failed ceremony.
 *
 * The raw errors are written for whoever is debugging the integration, not for
 * whoever just dismissed a system prompt — and the most common outcome by far
 * isn't an error in the user's mind at all: they changed their mind, or their
 * device had nothing to offer. Both must read as "carry on with your password",
 * never as a broken app.
 *
 * `code` is the discriminator on both error types supabase-js returns here:
 * `WebAuthnError` carries the `ERROR_*` codes below, `AuthError` carries server
 * codes and falls through to its own message.
 */
export function passkeyErrorMessage(
  error: { code?: string; message: string },
  context: "sign-in" | "enrolment"
): string {
  switch (error.code) {
    case "ERROR_CEREMONY_ABORTED":
      // Also what a browser reports when it holds no passkey for this site: it
      // has nothing to show, and the request ends exactly as a dismissal does.
      // The two are indistinguishable from here, so the copy covers both.
      return context === "sign-in"
        ? "No passkey was offered, or the prompt was dismissed. Sign in with your password instead."
        : "Setup was dismissed, so nothing was saved. You can try again.";
    case "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED":
      return "This device already has a passkey for your account.";
    case "ERROR_INVALID_DOMAIN":
    case "ERROR_INVALID_RP_ID":
      // A relying party mismatch is a deployment fault, not a user one.
      return "Passkeys aren't set up for this address. Sign in with your password instead.";
    default:
      return error.message;
  }
}
