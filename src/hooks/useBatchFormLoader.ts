
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayerFormResult } from "@/types";
import { getPlayerFormBatch } from "@/lib/player-form-service";

// Function to batch fetch player forms for multiple players in a single season
export const useBatchFormLoader = (
  seasonId: string | null,
  playerIds: string[]
) => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['batchPlayerForms', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};
      
      console.log(`Fetching batch player forms for season ${seasonId} with ${playerIds.length} players at ${new Date().toISOString()}`);
      
      try {
        // Always fetch fresh data
        const result = await getPlayerFormBatch(seasonId, playerIds);
        return result;
      } catch (err) {
        console.error("Error loading batch player forms:", err);
        return {};
      }
    },
    enabled: !!seasonId && playerIds.length > 0,
    // Don't cache at all - always fetch fresh data
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 0, // Don't automatically refetch - we'll control this from the component
  });

  return {
    formData: data || {},
    isLoading,
    error
  };
};
