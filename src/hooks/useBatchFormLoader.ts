
import { useQuery } from "@tanstack/react-query";
import { PlayerFormResult } from "@/types";

// Function to batch fetch player forms for multiple players in a single season
export const useBatchFormLoader = (
  seasonId: string | null,
  playerIds: string[]
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['batchPlayerForms', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};
      
      try {
        // Dynamic import to avoid circular dependencies
        const { getPlayerFormBatch } = await import('@/lib/player-form-service');
        return getPlayerFormBatch(seasonId, playerIds);
      } catch (err) {
        console.error("Error loading batch player forms:", err);
        return {};
      }
    },
    enabled: !!seasonId && playerIds.length > 0,
    staleTime: 60000, // Cache results for 1 minute
  });

  return {
    formData: data || {},
    isLoading,
    error
  };
};
