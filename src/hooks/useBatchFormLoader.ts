
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
    staleTime: 60000, // Reduced cache time to 1 minute
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true, // Refresh when component mounts
  });

  return {
    formData: data || {},
    isLoading,
    error
  };
};
