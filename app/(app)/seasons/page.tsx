"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronRight, Crown, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMatches, getPlayers, getSeasons, getSeasonChampions } from "@/lib/db";
import { outcomeOf } from "@/lib/match-result";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { Season, SeasonChampion } from "@/types";

const time = (date: string) => new Date(date).getTime();
const when = (season: Season) =>
  `${format(new Date(season.startDate), "MMM yyyy")}${
    season.endDate ? ` – ${format(new Date(season.endDate), "MMM yyyy")}` : season.isFinished ? "" : " – now"
  }`;

/** Gold, silver and bronze, in the shades the season stars use. */
const MEDAL = ["text-draw", "text-muted-foreground", "text-draw/60"];

/**
 * Every season as an honours board: the one running now at the top with its
 * podium as it stands, then every finished one with who won it, and the
 * roll of who has won most. A season's own page holds the rest.
 */
const Seasons = () => {
  const { currentTeam } = useTeam();
  const { canManage, ready } = usePermission();

  const { data: seasons = [], isLoading } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
    enabled: !!currentTeam,
  });
  const { data: champions = [] } = useQuery({
    queryKey: ["seasonChampions", currentTeam?.id],
    queryFn: () => getSeasonChampions(),
    enabled: !!currentTeam,
  });
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  // Counted from the matches, like everything else.
  const nights = useMemo(() => {
    const counts = new Map<string, number>();
    for (const match of matches) {
      if (!match.seasonId || outcomeOf(match) === null) continue;
      counts.set(match.seasonId, (counts.get(match.seasonId) ?? 0) + 1);
    }
    return counts;
  }, [matches]);

  const podium = (seasonId: string) =>
    champions.filter((c) => c.seasonId === seasonId && c.rank <= 3).sort((a, b) => a.rank - b.rank);

  const ordered = [...seasons].sort((a, b) => time(b.startDate) - time(a.startDate));
  const running = ordered.find((s) => !s.isFinished);
  const finished = ordered.filter((s) => s.isFinished);

  // Titles won, across every finished season; a shared first counts for each.
  const roll = useMemo(() => {
    const done = new Set(seasons.filter((s) => s.isFinished).map((s) => s.id));
    const titles = new Map<string, number>();
    for (const c of champions) {
      if (c.rank === 1 && done.has(c.seasonId)) titles.set(c.playerId, (titles.get(c.playerId) ?? 0) + 1);
    }
    return [...titles].sort((a, b) => b[1] - a[1]);
  }, [champions, seasons]);

  const face = (c: SeasonChampion, size: "xs" | "sm" | "md" = "sm") => (
    <PlayerAvatar name={c.playerName} image={byId.get(c.playerId)?.image ?? c.playerImage} size={size} />
  );

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Seasons"
        subtitle={
          seasons.length
            ? `${seasons.length} ${seasons.length === 1 ? "season" : "seasons"}, and who came out on top.`
            : "No seasons yet."
        }
        actions={
          ready &&
          canManage() && (
            <Button asChild size="sm">
              <Link href="/seasons/create">
                <Plus className="mr-1.5 h-4 w-4" />
                New season
              </Link>
            </Button>
          )
        }
      />

      {isLoading ? (
        <PageLoading rows={4} label="Loading the seasons" />
      ) : seasons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          Start a season to keep a table.
        </div>
      ) : (
        <div className="space-y-8">
          {running && (
            <Link
              href={`/seasons/${running.id}`}
              className="focus-ring grain relative block overflow-hidden rounded-2xl border border-accent/40 bg-surface p-5 transition-colors hover:border-accent sm:p-6"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
              <p className="page-kicker">Now playing</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">{running.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {nights.get(running.id) ?? 0} nights · {when(running)}
              </p>
              {podium(running.id).length > 0 && (
                <ol className="mt-4 grid grid-cols-3 gap-2">
                  {podium(running.id).slice(0, 3).map((c) => (
                    <li key={c.playerId} className="flex flex-col items-center rounded-xl border border-border bg-surface-2/50 p-3 text-center">
                      <span className={cn("scoreboard text-lg", MEDAL[c.rank - 1])}>{c.rank}</span>
                      {face(c, "md")}
                      <span className="mt-1.5 text-sm font-semibold leading-tight">{c.playerName.split(/\s+/)[0]}</span>
                      <span className="text-xs text-muted-foreground tabular">{c.points} pts</span>
                    </li>
                  ))}
                </ol>
              )}
              <span className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                The table <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          )}

          {finished.length > 0 && (
            <section>
              <h2 className="section-heading mb-4">Honours</h2>
              <ol className="space-y-2">
                {finished.map((season) => {
                  const top = podium(season.id);
                  const winners = top.filter((c) => c.rank === 1);
                  const rest = top.filter((c) => c.rank > 1);
                  return (
                    <li key={season.id}>
                      <Link
                        href={`/seasons/${season.id}`}
                        className="focus-ring flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-border-strong"
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-draw/10">
                          <Trophy className="h-6 w-6 text-draw" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs text-muted-foreground">
                            {season.name} · {nights.get(season.id) ?? 0} nights
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 font-semibold leading-tight">
                            {winners.length ? winners.map((c) => c.playerName).join(" & ") : "No champion"}
                            {winners[0] && (
                              <span className="text-sm font-normal text-muted-foreground tabular">{winners[0].points} pts</span>
                            )}
                          </span>
                          {rest.length > 0 && (
                            <span className="mt-1 block truncate text-xs text-muted-foreground">
                              then {rest.map((c) => c.playerName.split(/\s+/)[0]).join(", ")}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 -space-x-2">{winners.slice(0, 2).map((c) => <span key={c.playerId}>{face(c)}</span>)}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {roll.length > 0 && (
            <section>
              <h2 className="section-heading mb-4">Most titles</h2>
              <ul className="flex flex-wrap gap-2">
                {roll.map(([playerId, count]) => {
                  const player = byId.get(playerId);
                  return (
                    <li key={playerId}>
                      <Link
                        href={`/players/${playerId}`}
                        className="focus-ring flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:border-draw"
                      >
                        <PlayerAvatar name={player?.name ?? "?"} image={player?.image} size="xs" />
                        <span className="text-sm font-medium">{player?.name ?? "Unknown"}</span>
                        <span className="flex items-center gap-0.5 text-sm text-draw tabular">
                          <Crown className="h-3.5 w-3.5" />
                          {count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Seasons;
