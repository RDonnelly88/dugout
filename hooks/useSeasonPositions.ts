import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers, getSeasonPlayerStats } from "@/lib/db";
import { pointValues, seasonPositions } from "@/lib/season-positions";
import { useTeam } from "@/contexts/TeamContext";
import type { Player } from "@/types";

export interface PositionLine {
  playerId: string;
  player: Player | undefined;
  /** After each of the season's matches; null before their first. */
  positions: (number | null)[];
}

/**
 * The season's table after every match, for the position chart.
 *
 * Off the queries the season page already holds — every match, the players,
 * and the season's own table, which says what a win and a draw are worth — so
 * the chart and the table above it are two readings of the same thing.
 */
export function useSeasonPositions(seasonId: string) {
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const { data: table = [], isLoading: loadingTable } = useQuery({
    queryKey: ["seasonPlayerStats", seasonId],
    queryFn: () => getSeasonPlayerStats(seasonId),
  });

  const data = useMemo(() => {
    const values = pointValues(table);
    if (!values) return { matches: [], lines: [] as PositionLine[] };
    const byId = new Map(players.map((p) => [p.id, p]));
    const { matches: steps, lines } = seasonPositions(
      matches.filter((m) => m.seasonId === seasonId),
      values
    );
    return {
      matches: steps,
      lines: lines.map((line) => ({ ...line, player: byId.get(line.playerId) })),
    };
  }, [matches, players, table, seasonId]);

  return { ...data, isLoading: loadingMatches || loadingTable };
}
