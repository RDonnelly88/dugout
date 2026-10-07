"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, TrendingUp } from "lucide-react";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import RatingHistoryChart from "@/components/ratings/RatingHistoryChart";
import RatingMakeup from "@/components/ratings/RatingMakeup";
import { displayRating } from "@/lib/elo";
import { ELO } from "@/lib/config";
import { awayExplanation } from "@/components/ratings/away";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * A player's rating, with the shape of how it got there.
 *
 * The line is the same one the ratings page draws. It was a hand-rolled
 * sparkline, on the reasoning that forty points with no axes, labels or
 * interaction did not warrant a chart library — sound until the interaction
 * was the point. A player looking at their own rating is exactly who wants
 * to ask what a given night was, and the two of them drawing the same
 * history differently meant fixing one fixed nothing on the other.
 */
export default function PlayerRatingCard({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  const { ratingFor } = usePlayerRatings();
  const rating = ratingFor(playerId);
  // Shut to start with: the line is what most visits are for, and the sum
  // behind it is a long read on a phone.
  const [makeup, setMakeup] = useState(false);

  if (!rating || rating.games === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nothing to rate yet. Everyone starts at {ELO.start}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Rating over time
        </CardTitle>
        <CardDescription>
          {rating.unsettled
            ? `A rough guess so far — ${rating.games} of ${ELO.settledAfter} games behind it.`
            : `Peak ${displayRating(rating.peak)} · ${rating.games} games`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Said in words: a rise beside "missed one" read as a reward for
            not turning up. */}
        {rating.missed > 0 && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {awayExplanation(rating.missed)}
          </p>
        )}

        <div className="mt-2">
          <RatingHistoryChart
            players={[{ playerId, name: playerName, rating }]}
            height={200}
          />
        </div>

        <button
          type="button"
          onClick={() => setMakeup((open) => !open)}
          aria-expanded={makeup}
          className="focus-ring mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm font-medium hover:bg-surface-2"
        >
          How {displayRating(rating.rating)} is made up
          <ChevronDown
            aria-hidden
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", makeup && "rotate-180")}
          />
        </button>
        {makeup && (
          <div className="mt-3">
            <RatingMakeup rating={rating} name={playerName} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/ratings"
            className="focus-ring text-xs text-accent hover:underline"
          >
            See the whole table
          </Link>
          <Link
            href={`/compare?a=${playerId}`}
            className="focus-ring text-xs text-accent hover:underline"
          >
            Set beside somebody else&apos;s
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
