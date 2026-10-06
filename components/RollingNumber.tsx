"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * A figure on a stadium board: each digit a drum of nought to nine that rolls
 * round to its place.
 *
 * Starts every drum at nought and turns it once the page is up, so a score
 * arrives the way a board would show it; after that a change rolls from
 * wherever it stood. Under reduced motion the drums are already in place.
 *
 * Whole, non-negative numbers only — it is for scores, not ratings, which
 * have `Counter`.
 */
export default function RollingNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const target = Math.max(0, Math.round(value));
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    // A frame later, so the drums are drawn at nought first and the change
    // has something to roll from.
    const frame = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const settled = reduced || shown !== null ? target : null;
  const digits = String(target).split("").map(Number);

  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{target}</span>
      {digits.map((digit, i) => (
        <span
          // Keyed from the right, so a score reaching ten adds a drum on the
          // left rather than re-spinning the units.
          key={digits.length - i}
          aria-hidden
          className="inline-block h-[1em] overflow-hidden leading-none"
        >
          <span
            className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateY(-${settled === null ? 0 : digit}em)` }}
          >
            {DIGITS.map((d) => (
              <span key={d} className="h-[1em] leading-none">
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
