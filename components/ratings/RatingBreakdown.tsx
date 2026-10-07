"use client";

import { useMemo, useState } from "react";
import { displayRating, type PlayerRating } from "@/lib/elo";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import RatingMakeup from "@/components/ratings/RatingMakeup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Player } from "@/types";

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

  const player = choices.find((p) => p.id === picked) ?? choices[0];
  const rating = player ? ratings.get(player.id) : undefined;
  if (!player || !rating) return null;

  const first = player.name.split(/\s+/)[0];

  return (
    <div className="space-y-3 text-sm">
      <Select
        value={player.id}
        onValueChange={(id) => {
          setPicked(id);
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

      <RatingMakeup key={player.id} rating={rating} name={player.name} />
    </div>
  );
}
