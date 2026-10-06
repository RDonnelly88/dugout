import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/lib/db";
import { recentResults } from "@/lib/recent-results";
import { useTeam } from "@/contexts/TeamContext";
import type { RecentResult } from "@/types";

/**
 * How the squad has been going lately, over their recent nights together.
 *
 * The run to show anywhere that is not scoped to a season: the squad list,
 * a player's own page, the randomiser. A season page shows that season's
 * run instead, which is a different question with its own answer.
 *
 * Computed from the matches rather than fetched, like the ratings beside it,
 * and off the same query — so a grid of thirty players costs nothing beyond
 * the matches every page already has. Asking per player opened one request
 * each and let them arrive at different moments.
 */
export const useRecentResults = () => {
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const runs = useMemo(() => recentResults(matches), [matches]);

  return {
    runs,
    /** Newest first, with `dnp` for the nights they were not there. */
    resultsFor: (playerId: string): RecentResult[] =>
      runs.get(playerId)?.results ?? [],
    isLoading,
  };
};
