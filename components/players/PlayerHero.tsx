"use client";

import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";
import ResultStrip from "@/components/players/ResultStrip";
import Counter from "@/components/Counter";
import { AVATAR_TRANSITION } from "@/components/TransitionLink";
import { ELO } from "@/lib/config";
import { displayRating, type PlayerRating } from "@/lib/elo";
import type { PlayerSeason } from "@/lib/player-seasons";
import { cn } from "@/lib/utils";
import type { Player, PlayerRecord, RecentResult } from "@/types";

const ordinal = (n: number) => {
  const tail = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${tail}`;
};

function Figure({
  value,
  label,
  aside,
}: {
  value: React.ReactNode;
  label: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-3 py-3 text-center first:pl-0 last:pr-0">
      <p className="scoreboard text-2xl leading-none sm:text-3xl">{value}</p>
      <p className="eyebrow mt-1.5 truncate">{label}</p>
      {aside && <p className="mt-0.5 text-xs tabular">{aside}</p>}
    </div>
  );
}

/**
 * The top of a player's page: who they are and where they stand, in the
 * three numbers people ask about first — their rating, their place in the
 * squad by it, and how often they win — over the run they are on.
 */
export default function PlayerHero({
  player,
  rating,
  squadRank,
  squadSize,
  record,
  current,
  lastFive,
}: {
  player: Player;
  rating: PlayerRating | undefined;
  /** Their place by rating among everybody rated, or null before a game. */
  squadRank: number | null;
  squadSize: number;
  record: PlayerRecord;
  /** The season running now, if they have played in it. */
  current: PlayerSeason | null;
  lastFive: RecentResult[];
}) {
  // What the squad's most recent match did to the rating, whether or not they
  // were in it: their own last game may have been months ago.
  const change = rating ? Math.round(rating.lastChange) : 0;
  const winRate = record.played > 0 ? Math.round((record.wins / record.played) * 100) : null;

  return (
    <section className="grain relative mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
      {/* A wash of the accent behind the face, so the page opens on the
          player rather than on a grid of boxes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative flex items-center gap-4 p-4 sm:p-6">
        <PlayerAvatar
          name={player.name}
          image={player.image}
          size="xl"
          className="h-20 w-20 ring-4 ring-accent/30 sm:h-24 sm:w-24"
          style={{ viewTransitionName: AVATAR_TRANSITION }}
        />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {player.name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <PlayerSeasonStars playerId={player.id} size="md" />
            {current?.place && (
              <span>
                <span className="font-semibold text-foreground">{ordinal(current.place.position)}</span> in{" "}
                {current.season.name}
              </span>
            )}
            {!player.isActive && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">Not playing</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-3 divide-x divide-border border-y border-border bg-surface-2/40 px-4 sm:px-6">
        <Figure
          value={rating ? <Counter value={displayRating(rating.rating)} from={ELO.start} /> : ELO.start}
          label="Rating"
          aside={
            change !== 0 ? (
              <span className={change > 0 ? "text-win" : "text-loss"}>
                {change > 0 ? "▲" : "▼"} {Math.abs(change)}{" "}
                {rating?.missed === 0 ? "last match" : "while away"}
              </span>
            ) : (
              <span className="text-muted-foreground">no change</span>
            )
          }
        />
        <Figure
          value={squadRank ? `#${squadRank}` : "—"}
          label="Squad rank"
          aside={<span className="text-muted-foreground">of {squadSize}</span>}
        />
        <Figure
          value={winRate === null ? "—" : `${winRate}%`}
          label="Won"
          aside={<span className="text-muted-foreground">of {record.played} games</span>}
        />
      </div>

      <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="eyebrow">Last five</span>
        <ResultStrip results={lastFive} size="sm" />
      </div>
      {rating?.unsettled && (
        <p className={cn("relative px-4 pb-3 text-xs text-muted-foreground sm:px-6")}>
          The rating is a rough guess until {ELO.settledAfter} games are behind it.
        </p>
      )}
    </section>
  );
}
