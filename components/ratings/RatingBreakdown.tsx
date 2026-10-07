"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ELO } from "@/lib/config";
import { fadingSummary, ratingBreakdown } from "@/lib/ratings-guide";
import { displayRating, gameWeight, type PlayerRating } from "@/lib/elo";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import RatingWaterfall from "@/components/ratings/RatingWaterfall";
import ResultStrip from "@/components/players/ResultStrip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

/** Enough to see the fade at work without a phone's worth of scrolling. */
const SHOWN = 6;

// Nought gets no sign: a "−0" reads as a loss that never happened.
const signed = (x: number) =>
  Math.round(x) === 0 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(Math.round(x))}`;
const tone = (x: number) => (Math.round(x) > 0 ? "text-win" : Math.round(x) < 0 ? "text-loss" : "text-muted-foreground");

/** To a tenth, for the small amounts fading moves: most are under a point. */
const signed1 = (x: number) =>
  Math.abs(x) < 0.05 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(x).toFixed(1)}`;
const tone1 = (x: number) => (x >= 0.05 ? "text-win" : x <= -0.05 ? "text-loss" : "text-muted-foreground");

/** What a game loses each match, as a share of what it has left. */
const rate = Math.round((1 - gameWeight(1)) * 1000) / 10;

/**
 * One player's rating taken apart into the games it is made of, so the sum
 * the guide describes can be seen adding up: the start, plus what each game
 * was worth on the night times how much it still counts.
 *
 * Opens on whoever tops the table, since there is no telling which player
 * the viewer is; anybody who has played can be picked instead.
 */
export default function RatingBreakdown({
  ratings,
  players,
}: {
  ratings: Map<string, PlayerRating>;
  players: Player[];
}) {
  const choices = useMemo(
    () =>
      players
        .filter((p) => (ratings.get(p.id)?.games ?? 0) > 0)
        .sort((a, b) => ratings.get(b.id)!.rating - ratings.get(a.id)!.rating),
    [players, ratings]
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  const player = choices.find((p) => p.id === picked) ?? choices[0];
  const rating = player ? ratings.get(player.id) : undefined;
  if (!player || !rating) return null;

  const pieces = ratingBreakdown(rating);
  const shown = all ? pieces : pieces.slice(0, SHOWN);
  const rest = pieces.slice(shown.length);
  const restSum = rest.reduce((total, piece) => total + piece.now, 0);
  const restSettled = rest.reduce((total, piece) => total + piece.settled, 0);
  const restNext = rest.reduce((total, piece) => total + piece.next, 0);
  const sum = fadingSummary(pieces);
  const first = player.name.split(/\s+/)[0];

  return (
    <div className="space-y-3 text-sm">
      <Select
        value={player.id}
        onValueChange={(id) => {
          setPicked(id);
          setAll(false);
        }}
      >
        <SelectTrigger aria-label="Whose rating to take apart" className="h-11">
          <span className="flex min-w-0 items-center gap-2">
            <PlayerAvatar name={player.name} image={player.image} size="xs" />
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {choices.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-muted-foreground">
        {first} is on{" "}
        <span className="font-medium text-foreground tabular">{displayRating(rating.rating)}</span>.
        Every game of theirs is worth something fixed on the night it was played, and a little
        less with each match since, however long ago. Here is all of it added up.
      </p>

      <RatingWaterfall grid={sum} rating={rating.rating} />

      {/* The same figures as a grid that adds up across and down: what the
          games that gained points and the games that cost them were worth on
          the night, what fading has done to each since, what each comes to
          today, and what the next match will do to each. */}
      <div className="rounded-xl border border-border bg-surface-2/40 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-3 gap-y-1.5 tabular">
          <span />
          <span className="text-right text-[11px] uppercase leading-tight tracking-wide text-muted-foreground">
            Gained
            <span className="block normal-case tracking-normal">{sum.gained.games} games</span>
          </span>
          <span className="text-right text-[11px] uppercase leading-tight tracking-wide text-muted-foreground">
            Cost
            <span className="block normal-case tracking-normal">{sum.cost.games} games</span>
          </span>
          <span className="text-right text-[11px] uppercase leading-tight tracking-wide text-muted-foreground">
            All
            <span className="block normal-case tracking-normal">{sum.all.games} games</span>
          </span>
          {(
            [
              ["On the night", "night"],
              ["Faded since", "faded"],
              ["Today", "now"],
            ] as const
          ).map(([label, key]) => (
            <div key={key} className="contents">
              <span className={cn(key === "now" ? "border-t border-border pt-1.5 font-semibold" : "text-muted-foreground")}>
                {label}
              </span>
              {[sum.gained, sum.cost, sum.all].map((column, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-right",
                    tone(column[key]),
                    key === "now" && "border-t border-border pt-1.5 font-semibold"
                  )}
                >
                  {signed(column[key])}
                </span>
              ))}
            </div>
          ))}
          <span className="text-muted-foreground">Next match</span>
          {[sum.gained, sum.cost, sum.all].map((column, i) => (
            <span key={i} className={cn("text-right text-xs", tone1(column.next))}>
              {signed1(column.next)}
            </span>
          ))}
        </div>
        <p className="mt-2 border-t border-border pt-2 font-semibold tabular">
          {ELO.start} {sum.all.now < 0 ? "−" : "+"} {Math.abs(Math.round(sum.all.now))} ={" "}
          {displayRating(rating.rating)}, {first}&apos;s rating today
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Every game loses about {rate}% of what it is worth at each match, which always comes to
          about {rate}% of the way from {first}&apos;s rating back to {ELO.start}. The games that
          gained points shrink, which costs; the games that cost points shrink too, which gives
          back. When the two come to about the same they all but cancel, however many games are
          behind it.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface-2/40 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-2 tabular">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Game</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Night</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Now</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Next</span>

          {shown.map((piece) => {
            return (
              <div key={piece.matchId} className="contents">
                <span className="flex min-w-0 items-center gap-2">
                  <ResultStrip results={[piece.result]} size="xs" />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate">{format(parseISO(piece.date), "d MMM yy")}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {piece.age === 0
                        ? "the latest match"
                        : `${piece.age} ${piece.age === 1 ? "match" : "matches"} ago`}
                    </span>
                  </span>
                </span>
                <span className={cn("text-right", tone(piece.settled))}>{signed(piece.settled)}</span>
                <span className="text-right leading-tight">
                  <span className={cn("block font-medium", tone(piece.now))}>{signed(piece.now)}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {/* The oldest are never quite gone, and "0% left" would say they were. */}
                    {piece.weight >= 0.01 ? Math.round(piece.weight * 100) : "<1"}% left
                  </span>
                </span>
                <span className={cn("text-right text-xs", tone1(piece.next))}>{signed1(piece.next)}</span>
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
              <span className={cn("text-right font-medium", tone(restSum))}>{signed(restSum)}</span>
              <span className={cn("text-right text-xs", tone1(restNext))}>{signed1(restNext)}</span>
            </div>
          )}

          <span className="border-t border-border pt-2 font-semibold">All of it</span>
          <span className={cn("border-t border-border pt-2 text-right", tone(sum.all.night))}>
            {signed(sum.all.night)}
          </span>
          <span className={cn("border-t border-border pt-2 text-right font-semibold", tone(sum.all.now))}>
            {signed(sum.all.now)}
          </span>
          <span className={cn("border-t border-border pt-2 text-right text-xs", tone1(sum.all.next))}>
            {signed1(sum.all.next)}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Night is what the game was worth when it was played, and never changes. Now is that times
        how much of it is left. Next is what the next match takes off it. Rounding each line can
        leave a total a point out; the rating itself is worked out unrounded.
      </p>
    </div>
  );
}
