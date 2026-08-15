"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, Minus, TrendingUp } from "lucide-react";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { displayRating } from "@/lib/elo";
import { ELO } from "@/lib/config";
import { useChartTheme } from "@/lib/useChartTheme";
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
 * The sparkline is drawn by hand rather than with Recharts: it is forty points
 * with no axes, labels or interaction, and a chart library for that is several
 * hundred kilobytes to draw a squiggle.
 */
function Sparkline({ values, colour }: { values: number[]; colour: string }) {
  const reduced = useReducedMotion();
  if (values.length < 2) return null;

  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(1, high - low);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 30 - ((v - low) / span) * 28 - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="h-12 w-full"
      aria-hidden
    >
      {/* Fades in rather than drawing itself. A pathLength animation works by
          setting a dash array, and the axes here are scaled unevenly by
          preserveAspectRatio="none" — which stretches the dashes too and
          leaves the line in pieces. */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={colour}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function PlayerRatingCard({ playerId }: { playerId: string }) {
  const { ratingFor } = usePlayerRatings();
  const theme = useChartTheme();
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
  // Carries on past their last game for every match the squad played without
  // them, so the line finishes where the rating actually is. Without the tail
  // it stopped at whenever they last turned out, showing a figure that had
  // since drifted as though it were still standing.
  const values = [
    ...rating.history.map((h) => h.rating),
    ...rating.drifted.map((d) => d.rating),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Rating
        </CardTitle>
        <CardDescription>
          {rating.provisional
            ? `Still settling — ${ELO.provisionalGames - rating.games} more games to go.`
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

        <Sparkline values={values} colour={theme.accent} />

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
