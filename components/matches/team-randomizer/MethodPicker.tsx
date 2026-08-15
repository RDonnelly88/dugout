"use client";

import { motion, useReducedMotion } from "motion/react";
import { Dices, Scale, TrendingUp } from "lucide-react";
import type { BalanceMethod, Split } from "@/lib/team-balance";
import type { Player } from "@/types";

const METHODS: {
  value: BalanceMethod;
  label: string;
  blurb: string;
  Icon: typeof Dices;
}[] = [
  {
    value: "random",
    label: "Straight shuffle",
    blurb: "Pure luck. Nobody gets to argue with it.",
    Icon: Dices,
  },
  {
    value: "rating",
    label: "Even by rating",
    blurb: "Uses Elo, so the two sides should be as close as they can be.",
    Icon: Scale,
  },
  {
    value: "form",
    label: "Even by form",
    blurb: "Uses the last few results, so tonight's shape counts more than history.",
    Icon: TrendingUp,
  },
];

/**
 * Choosing how the sides get picked, with the result of each choice shown
 * before committing to it.
 *
 * The preview matters: "even by rating" is a claim, and the gap between the
 * two sides is the evidence for it. A shuffle showing a huge gap is not broken
 * — that is what a shuffle does — but you can see it before you deal.
 */
export default function MethodPicker({
  value,
  onChange,
  preview,
  disabled,
}: {
  value: BalanceMethod;
  onChange: (method: BalanceMethod) => void;
  /** The split each method would produce, for the gap readout. */
  preview: Record<BalanceMethod, Split<Player> | null>;
  disabled?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <fieldset disabled={disabled} className="grid gap-2 sm:grid-cols-3">
      <legend className="sr-only">How to pick the teams</legend>
      {METHODS.map(({ value: method, label, blurb, Icon }, i) => {
        const split = preview[method];
        const selected = value === method;

        return (
          <motion.button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            aria-pressed={selected}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduced ? 0 : i * 0.05 }}
            className={`focus-ring rounded-xl border p-3 text-left transition-colors disabled:opacity-50 ${
              selected
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-border-strong"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <Icon className={`h-4 w-4 ${selected ? "text-accent" : "text-muted-foreground"}`} />
              {label}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {blurb}
            </span>
            {split && method !== "random" && (
              <span className="eyebrow mt-2 block">
                gap {split.difference < 1 ? "<1" : Math.round(split.difference)}
              </span>
            )}
          </motion.button>
        );
      })}
    </fieldset>
  );
}
