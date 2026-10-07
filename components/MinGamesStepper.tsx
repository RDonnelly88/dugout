"use client";

import { Minus, Plus } from "lucide-react";

/**
 * The fewest games a player needs in the stretch to be on a web, to start
 * with: enough to clear the guests who came once or twice, whose handful of
 * lines would otherwise crowd the ring.
 */
export const MIN_GAMES = 5;

/**
 * How many games a player needs in the stretch to be on a web, a step at a
 * time from one up to the most anybody has: the density is the reader's call.
 */
export default function MinGamesStepper({
  value,
  most,
  onChange,
}: {
  value: number;
  /** The most games any link has, past which nothing would be left. */
  most: number;
  onChange: (value: number) => void;
}) {
  const step =
    "focus-ring flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40";
  return (
    <div className="flex h-8 items-center gap-1 rounded-full border border-border bg-surface px-1 text-xs">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Fewer games needed"
        className={step}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[6.5rem] text-center font-medium tabular" aria-live="polite">
        {value}+ games
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(most, value + 1))}
        disabled={value >= most}
        aria-label="More games needed"
        className={step}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
