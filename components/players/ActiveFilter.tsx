"use client";

import { Users, UserCheck } from "lucide-react";
import type { Player } from "@/types";

export type ActiveScope = "active" | "all";

/**
 * A squad that has run for years accumulates people who have stopped turning
 * up. Absent means absent, not retired — nobody gets deleted — so every list
 * of players needs to be able to hide them.
 */
export const isActivePlayer = (player: Pick<Player, "isActive">): boolean =>
  player.isActive !== false;

export const scopeTo = <T extends Pick<Player, "isActive">>(
  players: T[],
  scope: ActiveScope
): T[] => (scope === "active" ? players.filter(isActivePlayer) : players);

const OPTIONS: { value: ActiveScope; label: string; Icon: typeof Users }[] = [
  { value: "active", label: "Active", Icon: UserCheck },
  { value: "all", label: "Everyone", Icon: Users },
];

/**
 * One control, used everywhere a squad is listed, so "Active" means the same
 * thing on the players page as it does in the randomiser and the ratings.
 */
export default function ActiveFilter({
  value,
  onChange,
  counts,
  disabled,
}: {
  value: ActiveScope;
  onChange: (scope: ActiveScope) => void;
  /** Shown alongside each option when known. */
  counts?: Record<ActiveScope, number>;
  disabled?: boolean;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="flex w-fit items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      <legend className="sr-only">Which players to show</legend>
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={`focus-ring flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
              selected
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
            {counts && <span className="tabular opacity-70">{counts[option]}</span>}
          </button>
        );
      })}
    </fieldset>
  );
}
