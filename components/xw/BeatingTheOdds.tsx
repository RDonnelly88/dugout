"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Target } from "lucide-react";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { ELO } from "@/lib/config";
import { matchExpectations, playerLedgers, signedWins } from "@/lib/expected-wins";
import { withinTimeline, type Timeline } from "@/lib/timeline";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import Verdict from "@/components/xw/Verdict";
import LuckBar from "@/components/xw/LuckBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import type { Player } from "@/types";

const STRETCHES: Record<string, { label: string; timeline: Timeline }> = {
  recent: { label: `Last ${ELO.window}`, timeline: { kind: "recent", matches: ELO.window } },
  all: { label: "All time", timeline: { kind: "all" } },
};

/** Wins with a draw as a half, to one place, dropping a needless ".0". */
const wins = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/**
 * Everybody's results against the odds they were given: won, expected wins,
 * and the gap between the two.
 *
 * The rating says how good somebody is; this says whether their results have
 * been running ahead of that or behind it. A player well above their xW over
 * the last few weeks is winning more than the sides they are picked into
 * should — which is about as close to a hot streak as the numbers can get.
 */
export default function BeatingTheOdds({ players }: { players: Player[] }) {
  const { currentTeam } = useTeam();
  const [stretch, setStretch] = useState<keyof typeof STRETCHES>("recent");
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const rows = useMemo(() => {
    const odds = matchExpectations(matches);
    const sheets = playerLedgers(withinTimeline(matches, STRETCHES[stretch].timeline), odds);
    return players
      .flatMap((player) => {
        const ledger = sheets.get(player.id);
        return ledger && ledger.played > 0 ? [{ player, ledger }] : [];
      })
      .sort((a, b) => b.ledger.above - a.ledger.above || b.ledger.played - a.ledger.played);
  }, [matches, players, stretch]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Beating the odds
            </CardTitle>
            <CardDescription>
              Wins against expected wins (xW): what each player&apos;s sides were given
              before kick-off, added up. A draw counts a half.
            </CardDescription>
          </div>
          <SegmentedControl
            label="Over which matches"
            value={stretch}
            onValueChange={(next) => setStretch(next as keyof typeof STRETCHES)}
            className="h-10"
          >
            {Object.entries(STRETCHES).map(([key, { label }]) => (
              <SegmentedControlItem key={key} value={key} className="h-full px-3 text-xs font-medium">
                {label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="sheen h-48 rounded-lg" />
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing played yet.</p>
        ) : (
          <ol className="space-y-1">
            {rows.map(({ player, ledger }, index) => (
              <li key={player.id}>
                <Link
                  href={`/lineups?p=${player.id}`}
                  className="focus-ring grid grid-cols-[1.5rem_minmax(0,1fr)_3rem] items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong sm:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,10rem)_3rem_7.5rem]"
                >
                  <span className="tabular text-center text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <PlayerAvatar name={player.name} image={player.image} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{player.name}</span>
                      <span className="tabular block text-xs text-muted-foreground">
                        {ledger.played} {ledger.played === 1 ? "game" : "games"} ·{" "}
                        {wins(ledger.actual)} v {ledger.expected.toFixed(1)} xW
                      </span>
                    </span>
                  </span>
                  <LuckBar ledger={ledger} className="hidden sm:block" />
                  <span
                    className={`tabular text-right font-bold ${
                      ledger.above > 0.05
                        ? "text-win"
                        : ledger.above < -0.05
                          ? "text-loss"
                          : "text-muted-foreground"
                    }`}
                  >
                    {signedWins(ledger.above)}
                  </span>
                  <Verdict verdict={ledger.verdict} className="hidden justify-center sm:inline-flex" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
