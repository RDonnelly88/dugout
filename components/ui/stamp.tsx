"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const INK = {
  accent: "border-accent text-accent",
  win: "border-win text-win",
  draw: "border-draw text-draw",
  loss: "border-loss text-loss",
  plain: "border-foreground/70 text-foreground/70",
} as const;

/**
 * A referee's stamp: a ruled box of narrow capitals at a slant, the ink worn
 * in places, landing with a thump.
 *
 * Decoration only, and hidden from a screen reader, so whatever it says must
 * also be said in the text beside it. Under reduced motion it is simply
 * there, already stamped.
 */
export default function Stamp({
  children,
  ink = "accent",
  tilt = -8,
  className,
}: {
  children: React.ReactNode;
  ink?: keyof typeof INK;
  /** Degrees. A stamp is never put down square. */
  tilt?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={cn(
        "stamp-worn inline-block select-none rounded-sm border-[3px] px-2 py-0.5 font-display text-sm font-extrabold uppercase tracking-[0.18em] opacity-90 [font-stretch:72%]",
        INK[ink],
        className
      )}
      initial={reduced ? false : { scale: 1.8, opacity: 0, rotate: tilt }}
      animate={{ scale: 1, opacity: 0.9, rotate: tilt }}
      transition={{ type: "spring", stiffness: 520, damping: 24, delay: 0.25 }}
    >
      {children}
    </motion.span>
  );
}
