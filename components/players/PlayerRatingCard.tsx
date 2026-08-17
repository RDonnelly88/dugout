"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Minus, TrendingUp } from "lucide-react";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import RatingHistoryChart from "@/components/ratings/RatingHistoryChart";
import { displayRating } from "@/lib/elo";
import { ELO } from "@/lib/config";
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

  // What the squad's most recent match did to this rating, which is a drift
  // downwards if they were not in it. Their own last game is a different
  // question, and answering that one here made a rating look freshly earned
  // months after it was.
  const change = Math.round(rating.lastChange);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Rating
        </CardTitle>
        <CardDescription>
          {rating.unsettled
            ? `A rough guess so far — ${rating.games} of ${ELO.settledAfter} games behind it.`
            : `Peak ${displayRating(rating.peak)} · ${rating.games} games`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <p className="text-4xl font-bold tabular">
            {displayRating(rating.rating)}
          </p>
          <p
            className={`flex items-center gap-0.5 text-sm tabular ${
              change > 0 ? "text-win" : change < 0 ? "text-loss" : "text-muted-foreground"
            }`}
          >
            {change > 0 ? (
              <ChevronUp className="h-4 w-4" />
            ) : change < 0 ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            {Math.abs(change)}{" "}
            {rating.missed === 0
              ? "last game"
              : rating.missed === 1
                ? "missed one"
                : `missed ${rating.missed}`}
          </p>
        </div>

        <div className="mt-2">
          <RatingHistoryChart
            players={[{ playerId, name: playerName, rating }]}
            height={200}
          />
        </div>

        <Link
          href="/ratings"
          className="focus-ring text-xs text-accent hover:underline"
        >
          See the whole table
        </Link>
      </CardContent>
    </Card>
  );
}
