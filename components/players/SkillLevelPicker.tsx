"use client";

import { SKILL } from "@/lib/config";

const LEVELS = Array.from(
  { length: SKILL.max - SKILL.min + 1 },
  (_, i) => SKILL.min + i
);

/**
 * The one figure on a player somebody sets by hand.
 *
 * Five buttons rather than a slider or a number box: the scale is short, every
 * step has a name, and on a phone a slider that has to land exactly on 4 is a
 * fiddle. Filled up to the chosen level so it reads as a strength.
 */
export default function SkillLevelPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (level: number) => void;
  disabled?: boolean;
}) {
  const level = Math.min(Math.max(value, SKILL.min), SKILL.max);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {LEVELS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            aria-pressed={option === level}
            aria-label={`Level ${option}: ${SKILL.labels[option]}`}
            className={`focus-ring tabular h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 ${
              option <= level
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {level} · {SKILL.labels[level]}
      </p>
    </div>
  );
}
