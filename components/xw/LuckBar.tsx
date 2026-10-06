"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Ledger } from "@/lib/expected-wins";
import { cn } from "@/lib/utils";

/**
 * Where a set of results landed against the odds, drawn against the band
 * ordinary luck would have produced.
 *
 * The centre line is exactly what was expected. The shaded band is luck: a
 * marker inside it says nothing much, one outside it is the interesting kind.
 * The scale is set by whichever is wider, the gap or the band, so the marker
 * never falls off the end.
 */
export default function LuckBar({
  ledger,
  className,
}: {
  ledger: Pick<Ledger, "above" | "luck" | "played">;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const reach = Math.max(Math.abs(ledger.above), ledger.luck, 0.5) * 1.15;
  const at = (value: number) => 50 + (value / reach) * 50;
  const band = ledger.played > 0 ? (ledger.luck / reach) * 50 : 0;
  const good = ledger.above >= 0;

  return (
    <div
      aria-hidden
      className={cn("relative h-3 w-full rounded-full bg-surface-2", className)}
    >
      <div
        className="absolute inset-y-0 rounded-full bg-border/70"
        style={{ left: `${50 - band}%`, right: `${50 - band}%` }}
      />
      <div className="absolute inset-y-[-3px] left-1/2 w-px bg-border-strong" />
      {ledger.played > 0 && (
        <motion.div
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface",
            good ? "bg-win" : "bg-loss"
          )}
          // The same start whatever the motion setting, which the server
          // cannot know; reduced motion moves it at once.
          initial={{ left: "50%" }}
          animate={{ left: `${at(ledger.above)}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </div>
  );
}
