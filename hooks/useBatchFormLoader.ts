
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayerFormResult } from "@/types";
import { getPlayerFormBatch } from "@/lib/player-form-service";
import { useEffect } from "react";

// Function to batch fetch player forms for multiple players in a single season
export const useBatchFormLoader = (
  seasonId: string | null,
  playerIds: string[]
) => {
  const queryClient = useQueryClient();
  
  // Force refetch on mount and when dependencies change
  useEffect(() => {
    if (seasonId && playerIds.length > 0) {
      console.log(`Batch form loader refreshing data for season ${seasonId} with ${playerIds.length} players`);
      
      // Force refetch by removing query and then refetching
      queryClient.removeQueries({ queryKey: ['batchPlayerForms', seasonId, playerIds] });
      
      // Short timeout to ensure UI is responsive
      setTimeout(() => {
        queryClient.fetchQuery({ 
          queryKey: ['batchPlayerForms', seasonId, playerIds],
          queryFn: async () => {
            if (!seasonId || playerIds.length === 0) return {};
            return getPlayerFormBatch(seasonId, playerIds);
          }
        });
      }, 50);
    }
    
    // Cleanup function
    return () => {
      // No cleanup needed
    };
  }, [seasonId, playerIds.join(','), queryClient]);
  
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
    // Never cache - always fetch fresh data
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
