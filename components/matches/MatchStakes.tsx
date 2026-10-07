"use client";

import { Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { useSideNames } from "@/hooks/useSideNames";
import { displayRating } from "@/lib/elo";
import { matchStakes, type PlayerStake } from "@/lib/stakes";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

// Nought gets no sign: a "−0" reads as a loss that never happened.
const signed = (x: number) =>
  Math.round(x) === 0 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(Math.round(x))}`;
const tone = (x: number) =>
  Math.round(x) > 0 ? "text-win" : Math.round(x) < 0 ? "text-loss" : "text-muted-foreground";

const COLUMNS = "grid grid-cols-[minmax(0,1fr)_2.75rem_2.5rem_2.5rem_2.5rem] items-center gap-x-2";

/**
 * What a match about to be played stands to do to everybody's rating: the
 * chance each side is given, and for each player what a win, a draw and a
 * defeat would move them by.
 *
 * Shown wherever two sides exist before a ball is kicked, so the question
 * asked when the teams go up, "what's in it for me?", has its answer beside
 * them. Nothing appears until both sides have somebody in them.
 */
export default function MatchStakes({
  teamA,
  teamB,
  players,
  className,
}: {
  teamA: string[];
  teamB: string[];
  players: Player[];
  className?: string;
}) {
  const { ratings } = usePlayerRatings();
  const sides = useSideNames();
  const stakes = matchStakes(ratings, teamA, teamB);
  if (!stakes) return null;

  const byId = new Map(players.map((player) => [player.id, player]));
  const chance = { a: stakes.chanceA, b: 1 - stakes.chanceA };

  const side = (key: "a" | "b") => {
    const rows = stakes.players.filter((p) => p.side === key);
    return (
      <div className="min-w-0">
        <div className={cn(COLUMNS, "mb-1.5 text-xs text-muted-foreground")}>
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {key === "a" ? sides.A : sides.B}
            </span>
            <span className="tabular">{Math.round(chance[key] * 100)}%</span>
          </span>
          <span className="text-right">Now</span>
          <span className="text-right">Win</span>
          <span className="text-right">Draw</span>
          <span className="text-right">Lose</span>
        </div>
        <ul className="space-y-1">
          {rows.map((stake) => (
            <Row key={stake.playerId} stake={stake} player={byId.get(stake.playerId)} />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 shrink-0 text-accent" />
          What&apos;s at stake
        </CardTitle>
        <CardDescription>
          What each result would do to everybody&apos;s rating. A side given less of a chance
          has more to win and less to lose, and every older game fading by a match is in it
          too, which is why team-mates differ.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {side("a")}
        {side("b")}
      </CardContent>
    </Card>
  );
}

function Row({ stake, player }: { stake: PlayerStake; player: Player | undefined }) {
  const name = player?.name ?? "Unknown";
  return (
    <li className={cn(COLUMNS, "rounded-lg py-1 text-sm tabular")}>
      <span className="flex min-w-0 items-center gap-2">
        <PlayerAvatar name={name} image={player?.image} size="xs" />
        <span className="truncate">{name}</span>
      </span>
      <span className="text-right text-muted-foreground">{displayRating(stake.rating)}</span>
      <span className={cn("text-right font-semibold", tone(stake.change.win))}>
        {signed(stake.change.win)}
      </span>
      <span className={cn("text-right", tone(stake.change.draw))}>{signed(stake.change.draw)}</span>
      <span className={cn("text-right font-semibold", tone(stake.change.loss))}>
        {signed(stake.change.loss)}
      </span>
    </li>
  );
}
