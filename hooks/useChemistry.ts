"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers } from "@/lib/db";
import { chemistryFor } from "@/lib/chemistry";
import { useTeam } from "@/contexts/TeamContext";
import type { Player } from "@/types";

/** All-time, or a single season. */
export type ChemistryScope = string | "overall";

/**
 * Who a player does well with, and against.
 *
 * Two queries for the whole thing, both already cached by every other page.
 * The version this replaced awaited `getPlayer` inside a nested loop — one
 * request per teammate per match — and wrote the results back through
 * `setState` in an effect, so it re-ran on every render that touched matches.
 */
export function useChemistry(playerId: string, scope: ChemistryScope = "overall") {
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const byId = useMemo(() => {
    const map = new Map<string, Player>();
    for (const player of players) map.set(player.id, player);
    return map;
  }, [players]);

  const report = useMemo(() => {
    const scoped =
      scope === "overall" ? matches : matches.filter((m) => m.seasonId === scope);
    return chemistryFor(scoped, playerId);
  }, [matches, playerId, scope]);

  return {
    report,
    /** Names and faces for the ids the report returns. */
    playerFor: (id: string) => byId.get(id),
    isLoading: loadingMatches || loadingPlayers,
  };
}
