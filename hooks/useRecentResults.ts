import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/lib/db";
import { recentResults } from "@/lib/recent-results";
import { useTeam } from "@/contexts/TeamContext";
import type { RecentResult } from "@/types";

/**
 * How the squad has been going lately, over their recent nights together.
 *
 * Without a season, the squad's last few nights: the squad list, a player's
 * own page, the randomiser. With one, that season's last few, for its table —
 * by the same rules, so a newcomer is never marked missing nights from before
 * they arrived in either.
 *
 * Computed from the matches rather than fetched, like the ratings beside it,
 * and off the same query — so a grid of thirty players costs nothing beyond
 * the matches every page already has. Asking per player opened one request
 * each and let them arrive at different moments.
 */
export const useRecentResults = (seasonId?: string) => {
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  // A season's table reads that season's last few nights; everywhere else
  // reads the squad's.
  const runs = useMemo(
    () =>
      recentResults(
        matches,
        undefined,
        seasonId ? (m) => m.seasonId === seasonId : undefined
      ),
    [matches, seasonId]
  );

  return {
    runs,
    /** Newest first, with `dnp` for the nights they were not there. */
    resultsFor: (playerId: string): RecentResult[] =>
      runs.get(playerId)?.results ?? [],
    isLoading,
  };
};
