"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeftRight, Handshake, Swords } from "lucide-react";
import { getMatches, getPlayers, getSeasonPlayerStats, getSeasons } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { headToHead, rate, type Tally } from "@/lib/head-to-head";
import { winRate } from "@/lib/player-stats";
import { computeRatings, displayRating } from "@/lib/elo";
import { emptyRecord } from "@/lib/player-stats";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import RatingHistoryChart from "@/components/ratings/RatingHistoryChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * One row comparing a figure for two players, with a bar apiece.
 *
 * The bars are scaled against each other rather than against a fixed maximum,
 * so the row shows who is ahead and by how much — which is the only question
 * being asked on this page.
 */
function CompareRow({
  label,
  a,
  b,
  format = (n: number) => String(Math.round(n)),
  higherIsBetter = true,
}: {
  label: string;
  a: number;
  b: number;
  format?: (n: number) => string;
  higherIsBetter?: boolean;
}) {
  const reduced = useReducedMotion();
  const total = Math.abs(a) + Math.abs(b);
  const shareA = total === 0 ? 50 : (Math.abs(a) / total) * 100;
  const aAhead = higherIsBetter ? a > b : a < b;
  const level = a === b;

  return (
    <div className="grid grid-cols-[4rem_1fr_4rem] items-center gap-3 py-2 sm:grid-cols-[5rem_1fr_5rem]">
      <span
        className={`text-right text-sm tabular ${!level && aAhead ? "font-bold text-accent" : "text-muted-foreground"}`}
      >
        {format(a)}
      </span>

      <div>
        <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
          <motion.span
            className="bg-accent/70"
            initial={reduced ? false : { width: "50%" }}
            animate={{ width: `${shareA}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="flex-1 bg-info/50" />
        </div>
      </div>

      <span
        className={`text-sm tabular ${!level && !aAhead ? "font-bold text-info" : "text-muted-foreground"}`}
      >
        {format(b)}
      </span>
    </div>
  );
}

function TallyLine({
  label,
  tally,
  Icon,
  unit,
}: {
  label: string;
  tally: Tally;
  Icon: typeof Swords;
  /** "8 together" reads wrong under a tally of games spent opposing. */
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </p>
      {tally.played === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Never happened.</p>
      ) : (
        <>
          <p className="mt-2 text-2xl font-bold tabular">
            {tally.wins}
            <span className="text-muted-foreground">–</span>
            {tally.draws}
            <span className="text-muted-foreground">–</span>
            {tally.losses}
          </p>
          <p className="text-xs text-muted-foreground">
            {tally.played} {unit} · {pct(rate(tally))} win rate
          </p>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { currentTeam } = useTeam();

  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const { recordFor } = usePlayerRecords();
  const { ratingFor } = usePlayerRatings();

  const [scope, setScope] = useState<string>("overall");
  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
  });
  const { data: seasonStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", scope],
    queryFn: () => getSeasonPlayerStats(scope),
    enabled: scope !== "overall",
  });

  const scopedMatches = useMemo(
    () => (scope === "overall" ? matches : matches.filter((m) => m.seasonId === scope)),
    [matches, scope]
  );

  // All-time comes from the `player_stats` view and a season from
  // `season_player_stats` — the same two sources every other page reads, so a
  // figure here can never disagree with the same figure on the players page.
  const record = (playerId: string, name: string) => {
    if (scope === "overall") return recordFor(playerId, name);
    const found = seasonStats.find((stat) => stat.playerId === playerId);
    return found ? { ...emptyRecord(playerId, name), ...found } : emptyRecord(playerId, name);
  };

  // Elo has no per-season figure to look up, so a season is rated by replaying
  // only that season's results. Everyone starts level again, which is the
  // honest reading of "how did this season go".
  const seasonRatings = useMemo(
    () => (scope === "overall" ? null : computeRatings(scopedMatches)),
    [scope, scopedMatches]
  );
  const rating = (playerId: string) =>
    seasonRatings ? seasonRatings.get(playerId) : ratingFor(playerId);

  const sorted = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name)),
    [players]
  );

  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");

  const a = sorted.find((p) => p.id === aId) ?? sorted[0];
  const b = sorted.find((p) => p.id === bId) ?? sorted[1];

  const h2h = useMemo(
    () => (a && b ? headToHead(scopedMatches, a.id, b.id) : null),
    [scopedMatches, a, b]
  );

  if (sorted.length < 2) {
    return (
      <div className="page-container">
        <h1 className="page-title">Compare</h1>
        <p className="page-subtitle">
          Add a second player and you can put two of them side by side.
        </p>
      </div>
    );
  }

  const recordA = record(a.id, a.name);
  const recordB = record(b.id, b.name);
  const ratingA = rating(a.id);
  const ratingB = rating(b.id);
  const scopeName =
    scope === "overall"
      ? "all time"
      : (seasons.find((season) => season.id === scope)?.name ?? "this season");

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Compare"
        subtitle={
          <>
            Two players side by side, and — the part a league table can never show
          — how they get on with each other.
          </>
        }
      />

      <div className="mb-4">
        <Label htmlFor="compare-scope">Over</Label>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger id="compare-scope" className="mt-1 w-full sm:w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">All time</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor="compare-a">First player</Label>
          <Select value={a.id} onValueChange={setAId}>
            <SelectTrigger id="compare-a" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sorted.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          aria-label="Swap the two players"
          onClick={() => {
            setAId(b.id);
            setBId(a.id);
          }}
          className="focus-ring tap self-end rounded-lg border border-border text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <div>
          <Label htmlFor="compare-b">Second player</Label>
          <Select value={b.id} onValueChange={setBId}>
            <SelectTrigger id="compare-b" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sorted.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <PlayerAvatar name={a.name} image={a.image} size="md" />
              <span className="truncate font-semibold">{a.name}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-right font-semibold">{b.name}</span>
              <PlayerAvatar name={b.name} image={b.image} size="md" />
            </div>
          </div>

          <div className="divide-y divide-border">
            <CompareRow
              label={scope === "overall" ? "Rating" : "Rating this season"}
              a={ratingA?.rating ?? 0}
              b={ratingB?.rating ?? 0}
              format={(n) => String(displayRating(n))}
            />
            <CompareRow label="Played" a={recordA.played} b={recordB.played} />
            <CompareRow label="Won" a={recordA.wins} b={recordB.wins} />
            <CompareRow label="Win rate" a={winRate(recordA)} b={winRate(recordB)} format={pct} />
            <CompareRow label="Points" a={recordA.points} b={recordB.points} />
            <CompareRow
              label="Points per game"
              a={recordA.played ? recordA.points / recordA.played : 0}
              b={recordB.played ? recordB.points / recordB.played : 0}
              format={(n) => n.toFixed(2)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ratings over time</CardTitle>
          <CardDescription>
            The two of them since they started. Tap a line to read the night.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RatingHistoryChart
            players={[a, b].flatMap((player) => {
              const line = rating(player.id);
              return line
                ? [{ playerId: player.id, name: player.name, rating: line }]
                : [];
            })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When they meet</CardTitle>
          <CardDescription>
            Counted from {a.name}&apos;s side, over {scopeName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <TallyLine
            label="On the same team"
            tally={h2h!.together}
            Icon={Handshake}
            unit="together"
          />
          <TallyLine
            label="Against each other"
            tally={h2h!.against}
            Icon={Swords}
            unit="meetings"
          />
        </CardContent>
      </Card>
    </div>
  );
}
