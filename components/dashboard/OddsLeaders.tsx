"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import Verdict from "@/components/xw/Verdict";
import { ELO } from "@/lib/config";
import { matchExpectations, playerLedgers, signedWins } from "@/lib/expected-wins";
import { recentForm } from "@/lib/form";
import { withinTimeline } from "@/lib/timeline";
import type { Match, Player } from "@/types";

/**
 * Who is beating the odds lately.
 *
 * Wins against expected wins over the squad's recent matches: the players
 * whose results are running furthest ahead of what the sides they were in
 * were given. A better question than points a game, which mostly says who
 * happened to be picked into the stronger team. Nobody is listed until they
 * have games enough for the figure to mean something.
 */
export default function OddsLeaders({
  matches,
  players,
  limit = 5,
}: {
  matches: Match[];
  players: Player[];
  limit?: number;
}) {
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const leaders = useMemo(() => {
    const sheets = playerLedgers(
      withinTimeline(matches, { kind: "recent", matches: ELO.window }),
      matchExpectations(matches)
    );
    return [...sheets.entries()]
      .filter(([id, ledger]) => byId.has(id) && ledger.verdict !== "early")
      .sort(([, a], [, b]) => b.above - a.above)
      .slice(0, limit);
  }, [matches, byId, limit]);

  // The run beside each name: the same W/D/L strip as everywhere else.
  const runs = useMemo(() => recentForm(matches), [matches]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Beating the odds lately
            </CardTitle>
            <CardDescription>
              Wins above expected (xW) over the last {ELO.window} matches
            </CardDescription>
          </div>
          <Link
            href="/ratings"
            className="focus-ring flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            Everyone
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Not enough matches yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {leaders.map(([playerId, ledger], index) => {
              const player = byId.get(playerId)!;
              return (
                <li key={playerId}>
                  <Link
                    href={`/lineups?p=${playerId}`}
                    className="focus-ring flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/60"
                  >
                    <span className="tabular w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <PlayerAvatar name={player.name} image={player.image} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{player.name}</span>
                      <Verdict verdict={ledger.verdict} className="mt-0.5" />
                    </span>
                    <span className="hidden sm:block">
                      <PlayerFormDisplay results={runs.get(playerId)?.results ?? []} size="xs" />
                    </span>
                    <span
                      className={`tabular w-12 shrink-0 text-right font-semibold ${
                        ledger.above > 0.05
                          ? "text-win"
                          : ledger.above < -0.05
                            ? "text-loss"
                            : "text-muted-foreground"
                      }`}
                    >
                      {signedWins(ledger.above)}
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
