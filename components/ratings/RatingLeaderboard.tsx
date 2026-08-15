"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { displayRating, type PlayerRating } from "@/lib/elo";
import { ELO } from "@/lib/config";
import type { Player } from "@/types";

function Delta({ change }: { change: number }) {
  const rounded = Math.round(change);
  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />0
      </span>
    );
  }
  const up = rounded > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 tabular ${up ? "text-win" : "text-loss"}`}
    >
      {up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      {Math.abs(rounded)}
    </span>
  );
}

/**
 * The ratings table.
 *
 * The bar behind each row is the player's rating within the squad's own range,
 * not an absolute scale — a spread of forty points and a spread of four hundred
 * both fill the row, because what anyone wants to see is the order and the
 * gaps, and an absolute scale would render a tight squad as twelve identical
 * bars.
 */
export default function RatingLeaderboard({
  ratings,
  players,
}: {
  ratings: PlayerRating[];
  players: Player[];
}) {
  const reduced = useReducedMotion();
  const byId = new Map(players.map((p) => [p.id, p]));

  if (ratings.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nobody has played {ELO.provisionalGames} games yet, so no rating has
        settled. Keep going.
      </p>
    );
  }

  const values = ratings.map((r) => r.rating);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(1, high - low);

  return (
    <ol className="space-y-1">
      {ratings.map((rating, index) => {
        const player = byId.get(rating.playerId);
        if (!player) return null;

        const share = (rating.rating - low) / span;
        const last = rating.history.at(-1);

        return (
          <li key={rating.playerId}>
            <Link
              href={`/players/${rating.playerId}`}
              className="focus-ring relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong"
            >
              {/* Behind the content, so the row stays readable at any width. */}
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-accent/10"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${12 + share * 88}%` }}
                transition={{
                  duration: 0.7,
                  delay: reduced ? 0 : index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              <span className="relative w-6 shrink-0 text-center text-sm font-semibold tabular text-muted-foreground">
                {index + 1}
              </span>
              <PlayerAvatar name={player.name} image={player.image} size="sm" className="relative" />
              <span className="relative min-w-0 flex-1 truncate font-medium">
                {player.name}
              </span>
              <span className="relative hidden text-xs text-muted-foreground sm:block">
                {rating.games} games
              </span>
              {last && (
                <span className="relative w-12 text-right text-xs">
                  <Delta change={last.change} />
                </span>
              )}
              <span className="relative w-14 text-right text-base font-bold tabular">
                {displayRating(rating.rating)}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
