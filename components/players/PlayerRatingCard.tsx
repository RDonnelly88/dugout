"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import RatingHistoryChart from "@/components/ratings/RatingHistoryChart";
import { displayRating } from "@/lib/elo";
import { ELO } from "@/lib/config";
import { awayExplanation } from "@/components/ratings/away";
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
