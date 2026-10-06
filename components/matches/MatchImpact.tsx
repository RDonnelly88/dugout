"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Minus, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import TransitionLink from "@/components/TransitionLink";
import ResultStrip from "@/components/players/ResultStrip";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";
import { matchImpact, type SideImpact } from "@/lib/match-impact";
import { outcomeOf, resultFor } from "@/lib/match-result";
import { displayRating, expectedScore } from "@/lib/elo";
import { signedWins } from "@/lib/expected-wins";
import type { Match, Player } from "@/types";

function Change({ value, digits = 0 }: { value: number; digits?: number }) {
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />
        {(0).toFixed(digits)}
      </span>
    );
  }
  const up = rounded > 0;
  return (
    <span
      className={`tabular inline-flex items-center gap-0.5 ${up ? "text-win" : "text-loss"}`}
    >
      {up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      {Math.abs(rounded).toFixed(digits)}
    </span>
  );
}

/** One measure, as it stood before the match and after it. */
function Row({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="eyebrow">{label}</span>
      <span className="tabular flex items-baseline gap-2 text-sm">
        <span className="text-muted-foreground">{before}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-semibold">{after}</span>
        <Change value={after - before} />
      </span>
    </div>
  );
}

/**
 * The chance the ratings gave the side before kick-off, and what the result
 * made of it: a side given 40% that won took 0.6 of a win more than expected.
 */
function Odds({ chance, actual }: { chance: number; actual: number }) {
  const above = actual - chance;
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="eyebrow">Win chance</span>
      <span className="tabular flex items-baseline gap-2 text-sm">
        <span className="font-semibold">{Math.round(chance * 100)}%</span>
        <span
          className={
            above > 0.005 ? "text-win" : above < -0.005 ? "text-loss" : "text-muted-foreground"
          }
          title="Wins above what was expected: one for a win, a half for a draw, less the chance"
        >
          {signedWins(above)} xW
        </span>
      </span>
    </div>
  );
}

function Side({
  name,
  impact,
  players,
  match,
  chance,
  actual,
}: {
  name: string;
  impact: SideImpact;
  players: Map<string, Player>;
  /** The night in question, to pick this result out of the run. */
  match: Match;
  /** What the ratings gave this side before kick-off. */
  chance: number;
  /** One for a win, a half for a draw. */
  actual: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <h4 className="mb-2 font-semibold">{name}</h4>

      <div className="divide-y divide-border">
        <Odds chance={chance} actual={actual} />
        <Row
          label="Rating"
          before={displayRating(impact.ratingBefore)}
          after={displayRating(impact.ratingAfter)}
        />
      </div>

      <ul className="mt-3 space-y-2.5 border-t border-border pt-3">
        {impact.players.map((entry) => {
          const player = players.get(entry.playerId);
          return (
            <li key={entry.playerId}>
              <TransitionLink
                href={`/players/${entry.playerId}`}
                shareAvatar
                className="focus-ring flex items-center gap-2.5 rounded text-sm"
              >
                <PlayerAvatar name={player?.name ?? "Unknown"} image={player?.image} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">{player?.name ?? "Unknown"}</span>
                  {/* The run they walked in on, with this night ringed on the
                      end of it so the five before stay distinct from the one
                      being read. */}
                  <span className="mt-1 block">
                    <ResultStrip
                      results={entry.results}
                      size="xs"
                      latest={resultFor(match, entry.playerId) ?? undefined}
                    />
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold tabular">{displayRating(entry.after)}</span>
                  <span className="block text-xs">
                    <Change value={entry.change} />
                  </span>
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * What a played match did to the two sides.
 *
 * Only for a result. A fixture has not moved anything yet, and showing zeroes
 * for it would suggest it had.
 */
export default function MatchImpact({
  match,
  players,
}: {
  match: Match;
  players: Player[];
}) {
  const { currentTeam } = useTeam();
  const sides = useSideNames();

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const impact = useMemo(
    () => matchImpact(matches, match),
    [matches, match]
  );

  const byId = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );

  if (!impact) return null;

  const outcome = outcomeOf(match);
  const chanceA = expectedScore(impact.A.ratingBefore, impact.B.ratingBefore);
  const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          The sides
        </CardTitle>
        <CardDescription>
          Who played, the chance the ratings gave each side before kick-off,
          and what the result did to everybody&apos;s rating.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Side
          name={sides.A}
          impact={impact.A}
          players={byId}
          match={match}
          chance={chanceA}
          actual={actualA}
        />
        <Side
          name={sides.B}
          impact={impact.B}
          players={byId}
          match={match}
          chance={1 - chanceA}
          actual={1 - actualA}
        />
      </CardContent>
    </Card>
  );
}
