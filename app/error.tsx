"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

/**
 * Catches anything that throws while rendering a route. The `error` object is
 * stripped of its message in production, so the digest is the only handle on
 * which failure this was — surface it rather than a bare "something went wrong".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center glass-card p-8 rounded-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          That page failed to load. Trying again often clears it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            {error.digest}
          </p>
        )}
        <Button onClick={reset} className="w-full">
          <RotateCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  );
}
