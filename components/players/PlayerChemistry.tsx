"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, Handshake, Skull, Sparkles, Swords, Target, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { getSeasons } from "@/lib/db";
import { useChemistry, type ChemistryScope } from "@/hooks/useChemistry";
import type { ChemistryEntry } from "@/lib/chemistry";
import { signedWins } from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import type { PointValues } from "@/lib/season-positions";
import {
  enoughGames,
  pointsPerGame,
  ppg,
  rankBy,
  listTone,
  type Measure,
} from "@/lib/measure";
import { usePointValues } from "@/hooks/usePointValues";
import MeasureToggle from "@/components/MeasureToggle";
import PointsBar from "@/components/PointsBar";
import { cn } from "@/lib/utils";
import Verdict from "@/components/xw/Verdict";
import LuckBar from "@/components/xw/LuckBar";
import { useTeam } from "@/contexts/TeamContext";

/** Wins with a draw as a half, to one place, dropping a needless ".0". */
const wins = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

const TEXT = { ahead: "text-win", behind: "text-loss", level: "text-muted-foreground" } as const;

/** How the row is being read, and against what. */
interface Reading {
  measure: Measure;
  values: PointValues;
  /** The player's own points a game over the same games, on the record. */
  baseline: number;
}

function ChemistryRow({
  entry,
  name,
  image,
  rank,
  href,
  reading,
}: {
  entry: ChemistryEntry;
  name: string;
  image?: string | null;
  rank?: number;
  /** Where the row leads: the pair in the line-up lab, or the opponent's page. */
  href: string;
  reading: Reading;
}) {
  const { ledger } = entry;
  const { measure, values, baseline } = reading;
  const leaning = listTone(ledger, measure, values, baseline);
  return (
    <Link
      href={href}
      className="focus-ring flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/60"
    >
      {rank !== undefined && (
        <span className="tabular w-4 text-sm font-semibold text-muted-foreground">
          {rank}
        </span>
      )}
      <PlayerAvatar name={name} image={image} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className={cn("tabular shrink-0 text-sm font-semibold", TEXT[leaning])}>
            {measure === "record" ? (
              <>
                {ppg(pointsPerGame(ledger, values))}
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">pts a game</span>
              </>
            ) : (
              signedWins(ledger.above)
            )}
          </span>
        </div>
        <div className="mt-1.5">
          {measure === "record" ? (
            <PointsBar ledger={ledger} values={values} baseline={baseline} />
          ) : (
            <LuckBar ledger={ledger} className="h-2" />
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="tabular text-[11px] text-muted-foreground">
            {ledger.played} {ledger.played === 1 ? "game" : "games"} · {ledger.wins}W{" "}
            {ledger.draws}D {ledger.losses}L
            {measure === "odds" && ` · ${wins(ledger.actual)} v ${ledger.expected.toFixed(1)} xW`}
          </p>
          {measure === "odds" ? (
            <Verdict verdict={ledger.verdict} />
          ) : (
            !enoughGames(ledger) && (
              <span className="text-[11px] text-muted-foreground">Too few games to say</span>
            )
          )}
        </div>
      </div>
    </Link>
  );
}

function Lineup({
  title,
  description,
  Icon,
  tone,
  entries,
  playerFor,
  hrefFor,
  reading,
}: {
  reading: Reading;
  title: string;
  description: string;
  Icon: typeof Sparkles;
  tone: "win" | "loss";
  entries: ChemistryEntry[];
  playerFor: (id: string) => { name: string; image?: string | null } | undefined;
  hrefFor: (id: string) => string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${tone === "win" ? "text-win" : "text-loss"}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nobody with {XW.minGames} games yet.
          </p>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, i) => {
              const player = playerFor(entry.playerId);
              return (
                <ChemistryRow
                  key={entry.playerId}
                  entry={entry}
                  name={player?.name ?? "Unknown"}
                  image={player?.image}
                  rank={i + 1}
                  href={hrefFor(entry.playerId)}
                  reading={reading}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Tile({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  Icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Icon className="mb-2 h-4 w-4 text-accent" aria-hidden />
      <p className="tabular text-2xl font-bold">{value}</p>
      <p className="eyebrow mt-0.5">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Who a player wins with, and who they lose to.
 *
 * On the record first — points a game with or against each player, against
 * the player's own points a game over the same stretch — because that is what
 * people are asking. The same games against the odds are a toggle away. Either
 * way nobody makes a top four on fewer than five games together, so a best
 * team-mate is never somebody played beside once.
 */
export default function PlayerChemistry({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  const { currentTeam } = useTeam();
  const [scope, setScope] = useState<ChemistryScope>("overall");
  const { report, playerFor, isLoading } = useChemistry(playerId, scope);
  const values = usePointValues();
  const [chosen, setChosen] = useState<Measure>("record");

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chemistry</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sheen h-32 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // The record needs what a win and a draw are worth; until the table has
  // loaded there are only the odds to read.
  const measure: Measure = values ? chosen : "odds";
  const reading: Reading = {
    measure,
    values: values ?? { win: 1, draw: 0.5 },
    baseline: values ? pointsPerGame(report.own, values) : 0,
  };
  const ranked = (entries: ChemistryEntry[]) =>
    rankBy(entries, reading.measure, reading.values, reading.baseline);
  const alongside = ranked(report.withPlayers);
  const opposite = ranked(report.againstPlayers);
  const TOP = 4;
  const dreamTeam = alongside.filter((e) => enoughGames(e.ledger)).slice(0, TOP);
  const teamOfDeath = opposite.filter((e) => enoughGames(e.ledger)).reverse().slice(0, TOP);
  // A team-mate opens the pair in the line-up lab, where the two of them can
  // be taken apart; an opponent opens their own page.
  const pairHref = (id: string) => `/lineups?p=${playerId},${id}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Chemistry
            </CardTitle>
            <CardDescription>
              {measure === "record"
                ? `Who ${playerName} takes the most points with, and who they come unstuck against`
                : `Who ${playerName} beats the odds with, and who they come unstuck against — in wins above what the ratings expected`}
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
          {values && <MeasureToggle value={measure} onChange={setChosen} />}
          <Select value={scope} onValueChange={(value) => setScope(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {report.own.played === 0 ? (
          <div className="py-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No completed matches{scope === "overall" ? " yet" : " this season"}.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Tile
                label="Games"
                value={String(report.own.played)}
                Icon={Users}
                hint={scope === "overall" ? "All time" : "This season"}
              />
              {measure === "record" ? (
                <>
                  <Tile
                    label="Record"
                    value={`${report.own.wins}–${report.own.draws}–${report.own.losses}`}
                    Icon={Target}
                    hint="Won, drawn, lost"
                  />
                  <Tile
                    label="Points a game"
                    value={ppg(reading.baseline)}
                    Icon={Sparkles}
                    hint="What every row is set against"
                  />
                </>
              ) : (
                <>
                  <Tile
                    label="Won v xW"
                    value={`${wins(report.own.actual)} v ${report.own.expected.toFixed(1)}`}
                    Icon={Target}
                    hint="A draw counts a half"
                  />
                  <Tile
                    label="Above xW"
                    value={signedWins(report.own.above)}
                    Icon={Sparkles}
                    hint={
                      report.own.verdict === "early"
                        ? "Too early to say"
                        : report.own.verdict === "luck"
                          ? "Could be luck"
                          : `${report.own.verdict === "above" ? "Better" : "Worse"} than luck`
                    }
                  />
                </>
              )}
              <Tile
                label="Team-mates"
                value={String(report.withPlayers.length)}
                Icon={Handshake}
                hint={`${report.againstPlayers.length} different opponents`}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Lineup
                title="Dream team"
                description={
                  measure === "record"
                    ? `Beside these, ${playerName} takes the most points a game`
                    : `Beside these, ${playerName} beats the odds by the most`
                }
                Icon={Sparkles}
                tone="win"
                entries={dreamTeam}
                reading={reading}
                playerFor={playerFor}
                hrefFor={pairHref}
              />
              <Lineup
                title="Team of death"
                description={
                  measure === "record"
                    ? `Against these, ${playerName} takes the fewest points a game`
                    : `Against these, ${playerName} falls furthest short of the odds`
                }
                Icon={Skull}
                tone="loss"
                entries={teamOfDeath}
                reading={reading}
                playerFor={playerFor}
                hrefFor={(id) => `/players/${id}`}
              />
            </div>

            <Tabs defaultValue="with">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="with" className="gap-2">
                  <Handshake className="h-4 w-4" />
                  Alongside
                </TabsTrigger>
                <TabsTrigger value="against" className="gap-2">
                  <Swords className="h-4 w-4" />
                  Against
                </TabsTrigger>
              </TabsList>

              {(
                [
                  ["with", alongside],
                  ["against", opposite],
                ] as const
              ).map(([key, entries]) => (
                <TabsContent key={key} value={key} className="mt-3 space-y-1">
                  {entries.map((entry) => {
                    const player = playerFor(entry.playerId);
                    return (
                      <ChemistryRow
                        key={entry.playerId}
                        entry={entry}
                        name={player?.name ?? "Unknown"}
                        image={player?.image}
                        href={key === "with" ? pairHref(entry.playerId) : `/players/${entry.playerId}`}
                        reading={reading}
                      />
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {measure === "record" ? (
                  <>
                    The number beside each name is the points a game {playerName} took in the games
                    they shared, and the tick on each bar is {playerName}&apos;s own{" "}
                    {ppg(reading.baseline)}. Under {XW.minGames} games together there is too little to
                    rank. Switch to against the odds to allow for who else was on each side.
                  </>
                ) : (
                  <>
                    The number beside each name is wins above or below what the ratings expected
                    from the games they shared, so the rest of each side is already allowed for. The
                    shaded band is how far luck alone could move it; under {XW.minGames} games it is
                    too early to say.
                  </>
                )}
              </p>
              <Link
                href={`/lineups?p=${playerId}`}
                className="focus-ring flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-border-strong"
              >
                <FlaskConical className="h-4 w-4 text-accent" />
                Open in the line-up lab
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
