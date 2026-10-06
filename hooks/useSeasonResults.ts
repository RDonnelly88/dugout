import { useQuery } from "@tanstack/react-query";

import { getSeasonResultsBatch } from "@/lib/season-results-service";

/**
 * Recent results for a set of players in one season, fetched in a single request.
 *
 * Deliberately uncached: the run changes whenever a result is entered, and the
 * leaderboard is the first place anyone looks afterwards. `refetchOnMount` and
 * a zero `staleTime` are what keep it current — there is no separate effect
 * forcing a refresh, because one firing against this same query key cancelled
 * the request this hook was already making.
 */
export const useSeasonResults = (
  seasonId: string | null,
  playerIds: string[]
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['seasonResults', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};

      try {
        return await getSeasonResultsBatch(seasonId, playerIds);
      } catch (err) {
        console.error("Error loading batch player results:", err);
        return {};
      }
    },
    enabled: !!seasonId && playerIds.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  return {
    seasonResults: data || {},
    isLoading,
    error
  };
};
