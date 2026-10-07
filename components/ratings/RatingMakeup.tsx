"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import { ELO } from "@/lib/config";
import { fadingSummary, ratingBreakdown } from "@/lib/ratings-guide";
import { displayRating, gameWeight, type PlayerRating } from "@/lib/elo";
import RatingWaterfall, { type WaterfallScale } from "@/components/ratings/RatingWaterfall";
import ResultStrip from "@/components/players/ResultStrip";
import { cn } from "@/lib/utils";

/** Enough to see the fade at work without a phone's worth of scrolling. */
const SHOWN = 6;

// Nought gets no sign: a "−0" reads as a loss that never happened.
const signed = (x: number) =>
  Math.round(x) === 0 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(Math.round(x))}`;
const tone = (x: number) =>
  Math.round(x) > 0 ? "text-win" : Math.round(x) < 0 ? "text-loss" : "text-muted-foreground";

/** To a tenth, for the small amounts fading moves: most are under a point. */
const signed1 = (x: number) =>
  Math.abs(x) < 0.05 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(x).toFixed(1)}`;
const tone1 = (x: number) =>
  x >= 0.05 ? "text-win" : x <= -0.05 ? "text-loss" : "text-muted-foreground";

/** What a game loses each match, as a share of what it has left. */
const rate = Math.round((1 - gameWeight(1)) * 1000) / 10;

/**
 * What one player's rating is made of: the waterfall from the start to
 * today, the sum it comes to, and, a tap away, every game in it with what it
 * was worth on the night, what is left of it and what the next match takes.
 *
 * The one picture of a rating, wherever it is shown: the guide, the
 * player's own page, and two side by side.
 */
export default function RatingMakeup({
  rating,
  name,
  scale,
  full = true,
}: {
  rating: PlayerRating;
  name: string;
  /** A scale shared with another waterfall beside it, for comparing. */
  scale?: WaterfallScale;
  /**
   * Whether to explain the fading and offer the game-by-game table. Two side
   * by side show just the waterfall and the sum: the same paragraph twice
   * over is a long scroll on a phone between one player and the other.
   */
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);

  const pieces = ratingBreakdown(rating);
  const shown = all ? pieces : pieces.slice(0, SHOWN);
  const rest = pieces.slice(shown.length);
  const restSum = rest.reduce((total, piece) => total + piece.now, 0);
  const restSettled = rest.reduce((total, piece) => total + piece.settled, 0);
  const restNext = rest.reduce((total, piece) => total + piece.next, 0);
  const sum = fadingSummary(pieces);
  const first = name.split(/\s+/)[0];

  return (
    <div className="space-y-3 text-sm">
      <RatingWaterfall summary={sum} rating={rating.rating} scale={scale} />

      <p className="font-semibold tabular">
        {ELO.start} {sum.all.now < 0 ? "−" : "+"} {Math.abs(Math.round(sum.all.now))} ={" "}
        {displayRating(rating.rating)}, {first}&apos;s rating today
      </p>
      {full && (
        <p className="text-xs text-muted-foreground">
          Every game loses about {rate}% of what it is worth at each match, which always comes to
          about {rate}% of the way from {first}&apos;s rating back to {ELO.start}. The games that
          gained points shrink, which costs; the games that cost points shrink too, which gives
          back. When the two come to about the same they all but cancel, however many games are
          behind it.
        </p>
      )}

      {full && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="focus-ring flex items-center gap-1 rounded text-sm text-accent hover:underline"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
          {open ? "Hide the games" : `Every game, all ${pieces.length}`}
        </button>
      )}

      {full && open && (
        <>
          <div className="rounded-xl border border-border bg-surface-2/40 p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-2 tabular">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Game
              </span>
              <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                Night
              </span>
              <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                Now
              </span>
              <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                Next
              </span>

              {shown.map((piece) => {
                return (
                  <div key={piece.matchId} className="contents">
                    <span className="flex min-w-0 items-center gap-2">
                      <ResultStrip results={[piece.result]} size="xs" />
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate">
                          {format(parseISO(piece.date), "d MMM yy")}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {piece.age === 0
                            ? "the latest match"
                            : `${piece.age} ${piece.age === 1 ? "match" : "matches"} ago`}
                        </span>
                      </span>
                    </span>
                    <span className={cn("text-right", tone(piece.settled))}>
                      {signed(piece.settled)}
                    </span>
                    <span className="text-right leading-tight">
                      <span className={cn("block font-medium", tone(piece.now))}>
                        {signed(piece.now)}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {/* The oldest are never quite gone, and "0% left" would say they were. */}
                        {piece.weight >= 0.01 ? Math.round(piece.weight * 100) : "<1"}% left
                      </span>
                    </span>
                    <span className={cn("text-right text-xs", tone1(piece.next))}>
                      {signed1(piece.next)}
                    </span>
                  </div>
                );
              })}

              {rest.length > 0 && (
                <div className="contents">
                  <button
                    type="button"
                    onClick={() => setAll(true)}
                    className="focus-ring justify-self-start rounded text-left text-accent underline-offset-2 hover:underline"
                  >
                    {rest.length} older {rest.length === 1 ? "game" : "games"}
                  </button>
                  <span className={cn("text-right", tone(restSettled))}>{signed(restSettled)}</span>
                  <span className={cn("text-right font-medium", tone(restSum))}>
                    {signed(restSum)}
                  </span>
                  <span className={cn("text-right text-xs", tone1(restNext))}>
                    {signed1(restNext)}
                  </span>
                </div>
              )}

              <span className="border-t border-border pt-2 font-semibold">All of it</span>
              <span className={cn("border-t border-border pt-2 text-right", tone(sum.all.night))}>
                {signed(sum.all.night)}
              </span>
              <span
                className={cn(
                  "border-t border-border pt-2 text-right font-semibold",
                  tone(sum.all.now),
                )}
              >
                {signed(sum.all.now)}
              </span>
              <span
                className={cn(
                  "border-t border-border pt-2 text-right text-xs",
                  tone1(sum.all.next),
                )}
              >
                {signed1(sum.all.next)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Night is what the game was worth when it was played, and never changes. Now is that
            times how much of it is left. Next is what the next match takes off it. Rounding each
            line can leave a total a point out; the rating itself is worked out unrounded.
          </p>
        </>
      )}
    </div>
  );
}
