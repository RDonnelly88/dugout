
import { useQuery } from "@tanstack/react-query";
import { PlayerFormResult } from "@/types";
import { getPlayerFormBatch } from "@/lib/player-form-service";

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
        return await getPlayerFormBatch(seasonId, playerIds);
      } catch (err) {
        console.error("Error loading batch player forms:", err);
        return {};
      }
    },
    enabled: !!seasonId && playerIds.length > 0,
    staleTime: 300000, // Cache results for 5 minutes
    gcTime: 600000, // Keep unused data for 10 minutes
  });

  return {
    formData: data || {},
    isLoading,
    error
  };
};
