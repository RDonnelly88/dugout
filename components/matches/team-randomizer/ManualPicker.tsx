"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import type { Split } from "@/lib/team-balance";
import type { Player } from "@/types";
import { SIDE_NAMES } from "@/lib/config";

type Side = "A" | "B";

/**
 * Sorting the players into two sides by hand.
 *
 * Opens on a shuffle rather than an empty board, because starting from two
 * roughly even sides and moving three people is far less work than placing
 * everyone one at a time.
 */
export default function ManualPicker({
  players,
  start,
  onComplete,
  onCancel,
}: {
  players: Player[];
  /** The arrangement to open on. */
  start: Split<Player>;
  onComplete: (teamA: Player[], teamB: Player[]) => void;
  onCancel: () => void;
}) {
  const [sides, setSides] = useState<Record<string, Side>>(() => {
    const map: Record<string, Side> = {};
    for (const player of start.teamA) map[player.id] = "A";
    for (const player of start.teamB) map[player.id] = "B";
    return map;
  });

  // Anyone the starting split didn't cover lands on the first side rather
  // than vanishing.
  const sideOf = (player: Player): Side => sides[player.id] ?? "A";

  const teamA = players.filter((p) => sideOf(p) === "A");
  const teamB = players.filter((p) => sideOf(p) === "B");
  const usable = teamA.length > 0 && teamB.length > 0;

  const put = (playerId: string, side: Side) =>
    setSides((prev) => ({ ...prev, [playerId]: side }));

  const swapSides = () =>
    setSides(
      Object.fromEntries(
        players.map((p) => [p.id, sideOf(p) === "A" ? "B" : "A"] as const)
      )
    );

  return (
    <div>
      <DialogTitle className="text-center text-xl font-bold">
        Pick the teams
      </DialogTitle>
      <DialogDescription className="mt-1 text-center text-sm text-muted-foreground">
        {teamA.length} against {teamB.length}
      </DialogDescription>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={swapSides} className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Swap the sides over
        </Button>
      </div>

      <ul className="mt-4 space-y-1">
        {players.map((player) => {
          const side = sideOf(player);
          return (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/50 p-2"
            >
              <PlayerAvatar name={player.name} image={player.image} size="xs" />
              <span className="min-w-0 flex-1 truncate text-sm">{player.name}</span>

              <fieldset className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-surface p-0.5">
                <legend className="sr-only">Side for {player.name}</legend>
                {(["A", "B"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => put(player.id, option)}
                    aria-pressed={side === option}
                    className={`focus-ring rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      side === option
                        ? option === "A"
                          ? "bg-info/20 text-info"
                          : "bg-accent/20 text-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {SIDE_NAMES[option]}
                  </button>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button
          onClick={() => onComplete(teamA, teamB)}
          disabled={!usable}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Use these teams
        </Button>
        {!usable && (
          <p className="text-xs text-muted-foreground">
            Both sides need at least one player.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
