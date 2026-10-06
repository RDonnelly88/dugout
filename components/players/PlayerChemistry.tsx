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
import { pick, type ChemistryEntry } from "@/lib/chemistry";
import { signedWins } from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import Verdict from "@/components/xw/Verdict";
import LuckBar from "@/components/xw/LuckBar";
import { useTeam } from "@/contexts/TeamContext";

/** Wins with a draw as a half, to one place, dropping a needless ".0". */
const wins = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

function ChemistryRow({
  entry,
  name,
  image,
  rank,
  href,
}: {
  entry: ChemistryEntry;
  name: string;
  image?: string | null;
  rank?: number;
  /** Where the row leads: the pair in the line-up lab, or the opponent's page. */
  href: string;
}) {
  const { ledger } = entry;
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
          <span
            className={`tabular shrink-0 text-sm font-semibold ${
              ledger.above > 0.05
                ? "text-win"
                : ledger.above < -0.05
                  ? "text-loss"
                  : "text-muted-foreground"
            }`}
          >
            {signedWins(ledger.above)}
          </span>
        </div>
        <div className="mt-1.5">
          <LuckBar ledger={ledger} className="h-2" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="tabular text-[11px] text-muted-foreground">
            {ledger.played} {ledger.played === 1 ? "game" : "games"} · {ledger.wins}W{" "}
            {ledger.draws}D {ledger.losses}L · {wins(ledger.actual)} v {ledger.expected.toFixed(1)} xW
          </p>
          <Verdict verdict={ledger.verdict} />
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
}: {
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
 * Every figure is measured against the player's own average rather than
 * against nothing, and pulled towards it by how few games it rests on. That is
 * the whole reason this replaced the old panel, which would tell you your best
 * team-mate of all time was somebody you had played beside once.
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

  const dreamTeam = pick(report.withPlayers);
  // A team-mate opens the pair in the line-up lab, where the two of them can
  // be taken apart; an opponent opens their own page.
  const pairHref = (id: string) => `/lineups?p=${playerId},${id}`;
  const teamOfDeath = pick(report.againstPlayers, { worst: true });

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
              Who {playerName} beats the odds with, and who they come unstuck
              against — measured in wins above what the ratings expected
            </CardDescription>
          </div>

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
                description={`Beside these, ${playerName} beats the odds by the most`}
                Icon={Sparkles}
                tone="win"
                entries={dreamTeam}
                playerFor={playerFor}
                hrefFor={pairHref}
              />
              <Lineup
                title="Team of death"
                description={`Against these, ${playerName} falls furthest short of the odds`}
                Icon={Skull}
                tone="loss"
                entries={teamOfDeath}
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
                  ["with", report.withPlayers],
                  ["against", report.againstPlayers],
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
                      />
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-muted-foreground">
                The number beside each name is wins above or below what the ratings
                expected from the games they shared, so the rest of each side is already
                allowed for. The shaded band is how far luck alone could move it; under{" "}
                {XW.minGames} games it is too early to say.
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
