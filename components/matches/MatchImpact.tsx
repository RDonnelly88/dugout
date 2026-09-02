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
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";
import { matchImpact, type SideImpact } from "@/lib/match-impact";
import { resultFor } from "@/lib/match-result";
import { displayRating } from "@/lib/elo";
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
function Row({
  label,
  before,
  after,
  digits = 0,
  changed = true,
}: {
  label: string;
  before: number;
  after: number;
  digits?: number;
  /** False for a measure a result cannot move, like the hand-set level. */
  changed?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="eyebrow">{label}</span>
      <span className="tabular flex items-baseline gap-2 text-sm">
        {changed ? (
          <>
            <span className="text-muted-foreground">{before.toFixed(digits)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{after.toFixed(digits)}</span>
            <Change value={after - before} digits={digits} />
          </>
        ) : (
          <span className="font-semibold">{after.toFixed(digits)}</span>
        )}
      </span>
    </div>
  );
}

function Side({
  name,
  impact,
  players,
  match,
}: {
  name: string;
  impact: SideImpact;
  players: Map<string, Player>;
  /** The night in question, to pick this result out of the run. */
  match: Match;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <h4 className="mb-2 font-semibold">{name}</h4>

      <div className="divide-y divide-border">
        <Row
          label="Rating"
          before={displayRating(impact.ratingBefore)}
          after={displayRating(impact.ratingAfter)}
        />
        <Row
          label="Form"
          before={impact.formBefore}
          after={impact.formAfter}
          digits={2}
        />
        <Row label="Skill" before={impact.skill} after={impact.skill} digits={1} changed={false} />
      </div>

      <ul className="mt-3 space-y-1 border-t border-border pt-3">
        {impact.players.map((entry) => {
          const player = players.get(entry.playerId);
          return (
            <li
              key={entry.playerId}
              className="flex items-center gap-2 text-sm"
            >
              <PlayerAvatar
                name={player?.name ?? "Unknown"}
                image={player?.image}
                size="xs"
              />
              <span className="min-w-0 flex-1 truncate">
                {player?.name ?? "Unknown"}
              </span>
              {/* The run they walked in on, which is why two team-mates in
                  the same result took different numbers. Without it the card
                  looks arbitrary. This night is ringed on the end of it, so
                  the five that decided the weighting stay distinct from the
                  one being read. */}
              <PlayerFormDisplay
                results={entry.form}
                size="xs"
                latest={resultFor(match, entry.playerId) ?? undefined}
              />
              <span className="tabular text-muted-foreground">
                {displayRating(entry.after)}
              </span>
              <span className="w-12 text-right">
                <Change value={entry.change} />
              </span>
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
    () => matchImpact(matches, match, players),
    [matches, match, players]
  );

  const byId = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );

  if (!impact) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          What this match changed
        </CardTitle>
        <CardDescription>
          Each side&apos;s average going in and coming out. Skill is set by hand,
          so a result never moves it.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Side name={sides.A} impact={impact.A} players={byId} match={match} />
        <Side name={sides.B} impact={impact.B} players={byId} match={match} />
      </CardContent>
    </Card>
  );
}
