"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Handshake, Skull, Sparkles, Swords, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { getSeasons } from "@/lib/db";
import { useChemistry, type ChemistryScope } from "@/hooks/useChemistry";
import { MIN_GAMES, pick, type ChemistryEntry } from "@/lib/chemistry";

/**
 * The widest lift the bars are drawn to scale against.
 *
 * Twenty points either side of your own average is already a strong effect
 * once it has survived the shrinkage, and pinning the scale means two players'
 * charts can be compared by eye.
 */
const BAR_RANGE = 0.2;

const pct = (value: number) => `${Math.round(value * 100)}%`;
const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(Math.round(value * 100))}`;

function LiftBar({ lift }: { lift: number }) {
  const reduced = useReducedMotion();
  const width = Math.min(Math.abs(lift) / BAR_RANGE, 1) * 50;
  const good = lift >= 0;

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      {/* Centre line: the player's own average, which is what lift is measured
          against. Without it a bar is just a length with no zero. */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-border-strong" />
      <motion.div
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`absolute inset-y-0 ${good ? "left-1/2 bg-win" : "right-1/2 bg-loss"}`}
      />
    </div>
  );
}

function ChemistryRow({
  entry,
  name,
  image,
  rank,
}: {
  entry: ChemistryEntry;
  name: string;
  image?: string | null;
  rank?: number;
}) {
  const { tally, lift, confidence } = entry;

  return (
    <Link
      href={`/players/${entry.playerId}`}
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
              lift > 0.01 ? "text-win" : lift < -0.01 ? "text-loss" : "text-muted-foreground"
            }`}
          >
            {signed(lift)}
          </span>
        </div>
        <div className="mt-1">
          <LiftBar lift={lift} />
        </div>
        <p className="tabular mt-1 text-[11px] text-muted-foreground">
          {tally.played} {tally.played === 1 ? "game" : "games"} · {tally.wins}W {tally.draws}D{" "}
          {tally.losses}L · {pct(confidence)} confident
        </p>
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
}: {
  title: string;
  description: string;
  Icon: typeof Sparkles;
  tone: "win" | "loss";
  entries: ChemistryEntry[];
  playerFor: (id: string) => { name: string; image?: string | null } | undefined;
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
            Nobody with {MIN_GAMES} games yet.
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
  const [scope, setScope] = useState<ChemistryScope>("overall");
  const { report, playerFor, isLoading } = useChemistry(playerId, scope);

  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons"],
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
            <div key={i} className="shimmer h-32 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const dreamTeam = pick(report.withPlayers);
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
              Who {playerName} wins with, and who they come unstuck against
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
        {report.played === 0 ? (
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
                value={String(report.played)}
                Icon={Users}
                hint={scope === "overall" ? "All time" : "This season"}
              />
              <Tile
                label="Own average"
                value={pct(report.baseline)}
                Icon={Handshake}
                hint="A draw counts a half"
              />
              <Tile
                label="Team-mates"
                value={String(report.withPlayers.length)}
                Icon={Handshake}
                hint="Different people"
              />
              <Tile
                label="Opponents"
                value={String(report.againstPlayers.length)}
                Icon={Swords}
                hint="Different people"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Lineup
                title="Dream team"
                description={`Beside these four, ${playerName} does better than usual`}
                Icon={Sparkles}
                tone="win"
                entries={dreamTeam}
                playerFor={playerFor}
              />
              <Lineup
                title="Team of death"
                description="The side you would least like to line up against"
                Icon={Skull}
                tone="loss"
                entries={teamOfDeath}
                playerFor={playerFor}
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
                      />
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>

            <p className="text-xs leading-relaxed text-muted-foreground">
              The number beside each name is percentage points above or below{" "}
              {playerName}&apos;s own average, after allowing for how little some of
              these pairings have actually happened. One game together barely
              moves it;{" "}
              <Badge variant="outline" className="mx-0.5 align-middle text-[10px]">
                confident
              </Badge>{" "}
              is how much of the raw result survived that allowance.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
