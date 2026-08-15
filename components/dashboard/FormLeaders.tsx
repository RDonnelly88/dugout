"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { recentForm } from "@/lib/form";
import { FORM_LENGTH } from "@/lib/config";
import type { Match, Player } from "@/types";

/**
 * Who is going well right now.
 *
 * Recent form rather than the league table, which is the season so far and
 * says nothing about the last fortnight. Whoever is picking the sides wants
 * both, and they are frequently different people.
 */
export default function FormLeaders({
  matches,
  players,
  limit = 5,
}: {
  matches: Match[];
  players: Player[];
  limit?: number;
}) {
  const form = recentForm(matches);
  const byId = new Map(players.map((player) => [player.id, player]));

  const leaders = [...form.values()]
    // A single good night is not form. Anyone with fewer than a full window
    // behind them is ranked below those who have one.
    .filter((entry) => entry.games >= 3 && byId.has(entry.playerId))
    .sort((a, b) => b.pointsPerGame - a.pointsPerGame || b.games - a.games)
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-draw" />
          In form
        </CardTitle>
        <CardDescription>
          Points a game over the last {FORM_LENGTH}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Not enough matches yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {leaders.map((entry, index) => {
              const player = byId.get(entry.playerId)!;
              return (
                <li key={entry.playerId}>
                  <Link
                    href={`/players/${entry.playerId}`}
                    className="focus-ring flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/60"
                  >
                    <span className="tabular w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <PlayerAvatar
                      name={player.name}
                      image={player.image}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {player.name}
                    </span>
                    <PlayerFormDisplay results={entry.results} size="xs" />
                    <span className="tabular w-10 shrink-0 text-right font-semibold">
                      {entry.pointsPerGame.toFixed(1)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
