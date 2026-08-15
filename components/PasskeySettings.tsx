"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Fingerprint, KeyRound, Loader2, Trash2 } from "lucide-react";
import type { PasskeyListItem } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-browser";
import { passkeyErrorMessage, supportsWebAuthn } from "@/lib/passkeys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Passkey enrolment and management.
 *
 * There is no server action behind this: passkeys live in the auth schema
 * rather than a table of ours, and every call is authorised by the caller's own
 * session — the auth server resolves "which passkeys" from the JWT, so an id
 * from this list can only ever address the signed-in user's own credentials.
 *
 * The list is fetched on mount rather than passed down from the page, because
 * the server client has no passkey API to read it with.
 */
export default function PasskeySettings() {
  // `null` while the list is still in flight — distinct from an empty list,
  // which is a real answer and gets its own copy.
  const [passkeys, setPasskeys] = useState<PasskeyListItem[] | null>(null);
  const [hasWebAuthn, setHasWebAuthn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const load = useCallback(async () => {
    const { data, error: listError } = await supabase.auth.passkey.list();
    if (listError) {
      setError(listError.message);
      setPasskeys([]);
      return;
    }
    setPasskeys(data ?? []);
  }, []);

  useEffect(() => {
    setHasWebAuthn(supportsWebAuthn());
    // Worth loading either way: a browser that can't run a ceremony can still
    // show what's enrolled elsewhere, and revoke it.
    void load();
  }, [load]);

  async function register() {
    setError(null);
    setMessage(null);
    setBusy(true);
    const { data, error: regError } = await supabase.auth.registerPasskey();
    setBusy(false);

    if (regError) {
      setError(passkeyErrorMessage(regError, "enrolment"));
      return;
    }
    await load();
    setMessage("Passkey added.");
    // Opened straight into its name field: registration takes no name, so
    // without this every new passkey joins the list unlabelled and a second is
    // indistinguishable from the first.
    if (data) {
      setEditing(data.id);
      setDraftName("");
    }
  }

  async function saveName(passkeyId: string) {
    const friendlyName = draftName.trim();
    if (!friendlyName) {
      setError("Give the passkey a name so you can tell them apart.");
      return;
    }

    setError(null);
    setBusy(true);
    const { error: updateError } = await supabase.auth.passkey.update({
      passkeyId,
      friendlyName,
    });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(null);
    await load();
  }

  async function remove(passkeyId: string) {
    setError(null);
    setMessage(null);
    setBusy(true);
    const { error: deleteError } = await supabase.auth.passkey.delete({ passkeyId });
    setBusy(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setMessage("Passkey removed.");
    await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-accent" />
          Passkeys
        </CardTitle>
        <CardDescription>
          Sign in with your fingerprint, face or device PIN instead of a
          password. Your password keeps working either way.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        {message && (
          <output className="block text-sm text-accent">{message}</output>
        )}

        {passkeys === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No passkeys yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-800 p-3"
              >
                {editing === passkey.id ? (
                  <>
                    <Input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="e.g. Work laptop"
                      aria-label="Passkey name"
                      className="h-9"
                    />
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => saveName(passkey.id)}
                        disabled={busy}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(null)}
                        disabled={busy}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {passkey.friendly_name || "Unnamed passkey"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {format(new Date(passkey.created_at), "d MMM yyyy")}
                        {passkey.last_used_at &&
                          ` · last used ${format(new Date(passkey.last_used_at), "d MMM yyyy")}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(passkey.id);
                          setDraftName(passkey.friendly_name ?? "");
                        }}
                        disabled={busy}
                      >
                        Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(passkey.id)}
                        disabled={busy}
                        aria-label={`Remove ${passkey.friendly_name || "passkey"}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {hasWebAuthn ? (
          <Button onClick={register} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                Waiting for your device…
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" aria-hidden />
                Add a passkey
              </>
            )}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            This browser can&apos;t create passkeys. Anything added elsewhere
            still shows above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
