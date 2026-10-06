"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ELO } from "@/lib/config";
import { displayRating, type PlayerRating } from "@/lib/elo";
import { ratingBreakdown } from "@/lib/ratings-guide";
import PlayerAvatar from "@/components/players/PlayerAvatar";
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

/**
 * One player's rating taken apart into the games it is made of, so the sum
 * the guide describes can be seen adding up: the start, plus what each game
 * was worth on the night times how much it still counts.
 *
 * Opens on whoever tops the table, since there is no telling which player
 * the viewer is; anybody with a game still counting can be picked instead.
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
        .filter((p) => (ratings.get(p.id)?.counted ?? 0) > 0)
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
  const restSum = rest.reduce((sum, piece) => sum + piece.now, 0);
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
        <span className="font-medium text-foreground tabular">
          {displayRating(rating.rating)}
        </span>
        . Here is every game of theirs still counting, newest first: what it was
        worth on the night, which never changes, and how much of that it counts
        for now it is older.
      </p>

      <div className="rounded-xl border border-border bg-surface-2/40 p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-2 tabular">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Game</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">On the night</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Counts</span>
          <span className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">Now</span>

          {shown.map((piece) => (
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
              <span className="text-right text-muted-foreground">{Math.round(piece.weight * 100)}%</span>
              <span className={cn("text-right font-medium", tone(piece.now))}>{signed(piece.now)}</span>
            </div>
          ))}

          {rest.length > 0 && (
            <div className="contents">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="focus-ring col-span-3 justify-self-start rounded text-left text-accent underline-offset-2 hover:underline"
              >
                {rest.length} older {rest.length === 1 ? "game" : "games"}
              </button>
              <span className={cn("text-right font-medium", tone(restSum))}>{signed(restSum)}</span>
            </div>
          )}

          <span className="col-span-3 border-t border-border pt-2 text-muted-foreground">
            Everybody starts on
          </span>
          <span className="border-t border-border pt-2 text-right">{ELO.start}</span>

          <span className="col-span-3 font-semibold">{first}&apos;s rating</span>
          <span className="text-right font-semibold">{displayRating(rating.rating)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Each &ldquo;now&rdquo; is the night&apos;s amount times how much the game
        still counts. Rounding each line can leave the total a point out; the
        rating itself is worked out unrounded.
      </p>
    </div>
  );
}
