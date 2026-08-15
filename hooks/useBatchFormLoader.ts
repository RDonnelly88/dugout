import { useQuery } from "@tanstack/react-query";

import { getPlayerFormBatch } from "@/lib/player-form-service";

/**
 * Recent form for a set of players in one season, fetched in a single request.
 *
 * Deliberately uncached: form changes whenever a result is entered, and the
 * leaderboard is the first place anyone looks afterwards. `refetchOnMount` and
 * a zero `staleTime` are what keep it current — there is no separate effect
 * forcing a refresh, because one firing against this same query key cancelled
 * the request this hook was already making.
 */
export const useBatchFormLoader = (
  seasonId: string | null,
  playerIds: string[]
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['batchPlayerForms', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};

      try {
        return await getPlayerFormBatch(seasonId, playerIds);
      } catch (err) {
        console.error("Error loading batch player forms:", err);
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
    formData: data || {},
    isLoading,
    error
  };
};
