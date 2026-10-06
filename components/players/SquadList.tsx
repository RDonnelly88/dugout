"use client";

import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";
import ResultStrip from "@/components/players/ResultStrip";
import ActiveSwitch from "@/components/players/ActiveSwitch";
import TransitionLink from "@/components/TransitionLink";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { useRecentResults } from "@/hooks/useRecentResults";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import { getMatches } from "@/lib/db";
import { ELO } from "@/lib/config";
import { displayRating } from "@/lib/elo";
import { matchExpectations, playerLedgers, signedWins } from "@/lib/expected-wins";
import { orderPlayers, type PlayerSort } from "@/lib/player-order";
import { winRate } from "@/lib/player-stats";
import { withinTimeline } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { isActivePlayer, scopeTo, type ActiveScope } from "./ActiveFilter";
import type { Player, SeasonPlayerStats } from "@/types";

/**
 * The squad as a list a thumb can run down: a face, a full name, the last
 * five, and the one figure the list is sorted by at the end of the row.
 *
 * Managing the squad is a mode rather than three buttons on every row, so the
 * names get the width when you are reading and the controls get it when you
 * are changing who is in.
 */
export default function SquadList({
  players,
  seasonStats,
  searchTerm,
  scope,
  sort,
  managing,
  onDeleteClick,
}: {
  players: Player[];
  /** This season's table rows, for the place and points under each name. */
  seasonStats: SeasonPlayerStats[];
  searchTerm: string;
  scope: ActiveScope;
  sort: PlayerSort;
  managing: boolean;
  onDeleteClick: (player: Player) => void;
}) {
  const { recordFor } = usePlayerRecords();
  // The ratings hook replays the whole history, so it is asked once for the
  // list rather than once a row.
  const { ratingFor } = usePlayerRatings();
  const { resultsFor } = useRecentResults();
  const { canManage, ready } = usePermission();

  // Wins against expected wins over the rating's own window, for sorting by
  // who is beating the odds lately. The odds come from the whole history.
  const { currentTeam } = useTeam();
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const recentOdds = React.useMemo(
    () =>
      playerLedgers(
        withinTimeline(matches, { kind: "recent", matches: ELO.window }),
        matchExpectations(matches)
      ),
    [matches]
  );

  const rows = React.useMemo(() => {
    const matching = scopeTo(players, scope).filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return orderPlayers(
      matching.map((player) => {
        const record = recordFor(player.id, player.name);
        const odds = recentOdds.get(player.id);
        return {
          ...player,
          rating: ratingFor(player.id),
          aboveXw: odds && odds.played > 0 ? odds.above : undefined,
          played: record.played,
          wins: record.wins,
        };
      }),
      sort
    );
  }, [players, scope, searchTerm, sort, recentOdds, recordFor, ratingFor]);

  const seasonRow = (id: string) => seasonStats.find((s) => s.playerId === id);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="mb-4 text-muted-foreground">
          {searchTerm
            ? "Nobody by that name"
            : scope === "active"
              ? "Nobody active — try Everyone"
              : "No players yet"}
        </p>
        {!searchTerm && players.length === 0 && ready && canManage() && (
          <Button asChild>
            <Link href="/players/add">
              <Plus className="mr-2 h-4 w-4" />
              Add player
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <ol className="grid gap-2 lg:grid-cols-2">
      {rows.map((player, index) => {
        const record = recordFor(player.id, player.name);
        const season = seasonRow(player.id);
        const run = resultsFor(player.id);
        const inactive = !isActivePlayer(player);

        // The figure the list is sorted by, so the order explains itself.
        const figure = (() => {
          switch (sort) {
            case "odds":
              return player.aboveXw === undefined
                ? { value: "—", label: "vs xW" }
                : { value: signedWins(player.aboveXw), label: "vs xW", tone: player.aboveXw > 0 ? "text-win" : player.aboveXw < 0 ? "text-loss" : "" };
            case "played":
              return { value: String(record.played), label: "games" };
            case "winRate":
              return { value: record.played ? `${Math.round(winRate(record) * 100)}%` : "—", label: "won" };
            default:
              return player.rating
                ? { value: String(displayRating(player.rating.rating)), label: player.rating.unsettled ? "rough" : "rating" }
                : { value: "—", label: "rating" };
          }
        })();

        const body = (
          <>
            {sort !== "name" && !managing && (
              <span className="w-5 shrink-0 text-center text-sm font-semibold tabular text-muted-foreground">
                {index + 1}
              </span>
            )}
            <PlayerAvatar name={player.name} image={player.image} size="md" className={cn(inactive && "opacity-60")} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className={cn("font-semibold leading-tight", inactive && "text-muted-foreground")}>
                  {player.name}
                </span>
                <PlayerSeasonStars playerId={player.id} size="sm" />
                {inactive && (
                  <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Not playing
                  </span>
                )}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground tabular">
                {run.length > 0 && <ResultStrip results={run} size="xs" />}
                <span>
                  {season && season.played > 0
                    ? `${season.points} pts this season`
                    : record.played > 0
                      ? `${record.played} games`
                      : "Yet to play"}
                </span>
              </span>
            </span>
          </>
        );

        return (
          <li key={player.id}>
            {managing ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                {body}
                <span className="flex shrink-0 items-center gap-1">
                  <ActiveSwitch player={player} />
                  <Link
                    href={`/players/edit/${player.id}`}
                    aria-label={`Edit ${player.name}`}
                    className="focus-ring rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(player)}
                    aria-label={`Delete ${player.name}`}
                    className="focus-ring rounded-md p-2 text-muted-foreground transition-colors hover:bg-loss/15 hover:text-loss"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ) : (
              <TransitionLink
                href={`/players/${player.id}`}
                shareAvatar
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl border bg-surface p-3 transition-colors hover:border-border-strong",
                  index === 0 && sort === "rank" ? "border-accent/50" : "border-border"
                )}
              >
                {body}
                <span className="shrink-0 text-right">
                  <span className={cn("block text-lg font-bold leading-none tabular", "tone" in figure && figure.tone)}>
                    {figure.value}
                  </span>
                  <span className="eyebrow mt-1 block">{figure.label}</span>
                </span>
              </TransitionLink>
            )}
          </li>
        );
      })}
    </ol>
  );
}
