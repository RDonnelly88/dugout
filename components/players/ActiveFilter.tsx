"use client";

import { Users, UserCheck } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
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
    <SegmentedControl
      label="Which players to show"
      value={value}
      onValueChange={(next) => onChange(next as ActiveScope)}
      disabled={disabled}
      className="h-10"
    >
      {OPTIONS.map(({ value: option, label, Icon }) => (
        <SegmentedControlItem
          key={option}
          value={option}
          className="h-full px-3 text-xs font-medium"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
          {counts && <span className="tabular opacity-70">{counts[option]}</span>}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
