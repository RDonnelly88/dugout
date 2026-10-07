"use client";

import Link from "next/link";
import { ChevronRight, Sparkles, Trophy } from "lucide-react";
import type { PlayerSeason } from "@/lib/player-seasons";
import { cn } from "@/lib/utils";

/** Gold, silver and bronze, in the shades the season stars use. */
const MEDAL = ["text-draw", "text-muted-foreground", "text-draw/60"];

/**
 * Every season a player has had, newest first: where they finished, their
 * record, and their wrapped. One row a season, so five years of them read
 * as a career rather than a row of tabs.
 */
export default function PlayerSeasonsList({
  playerId,
  seasons,
}: {
  playerId: string;
  seasons: PlayerSeason[];
}) {
  if (seasons.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No seasons yet.</p>;
  }

  return (
    <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {seasons.map(({ season, played, wins, draws, losses, points, place }) => {
        const podium = place && place.position <= 3;
        return (
          <li key={season.id} className="flex items-center gap-3 p-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-2",
                podium && "border-draw/40"
              )}
            >
              {podium ? (
                <Trophy className={cn("h-5 w-5", MEDAL[place.position - 1])} />
              ) : (
                <span className="scoreboard text-lg leading-none">{place ? place.position : "–"}</span>
              )}
            </div>
            <Link href={`/seasons/${season.id}`} className="focus-ring min-w-0 flex-1 rounded">
              <p className="truncate font-semibold">
                {season.name}
                {season.isCurrent && (
                  <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 align-middle text-[11px] font-medium text-accent">
                    Now
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground tabular">
                {place ? `${place.position} of ${place.of}` : "Unplaced"} · {played} played ·{" "}
                <span className="text-win">{wins}W</span> <span className="text-draw">{draws}D</span>{" "}
                <span className="text-loss">{losses}L</span>
                {points !== null && <> · {points} pts</>}
              </p>
            </Link>
            <Link
              href={`/seasons/${season.id}/wrapped/${playerId}`}
              className="focus-ring flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Wrapped
              <ChevronRight className="h-3 w-3" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
