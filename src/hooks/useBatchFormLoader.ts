
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
  
  // Force a refetch when the component mounts or when dependencies change
  useEffect(() => {
    if (seasonId && playerIds.length > 0) {
      // Invalidate the query to ensure fresh data on every visit
      queryClient.invalidateQueries({ 
        queryKey: ['batchPlayerForms', seasonId, playerIds] 
      });
      
      // Force an immediate refetch
      queryClient.refetchQueries({
        queryKey: ['batchPlayerForms', seasonId, playerIds],
        exact: true
      });
    }
  }, [seasonId, playerIds.join(','), queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['batchPlayerForms', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};
      
      try {
        // Always fetch fresh data
        return await getPlayerFormBatch(seasonId, playerIds);
      } catch (err) {
        console.error("Error loading batch player forms:", err);
        return {};
      }
    },
    enabled: !!seasonId && playerIds.length > 0,
    staleTime: 0, // Never consider data fresh
    cacheTime: 0, // Don't cache at all
    refetchOnWindowFocus: true,
    refetchOnMount: "always", // Always refetch on mount
    refetchInterval: 1000, // Refetch every second while the page is open
  });

  return {
    formData: data || {},
    isLoading,
    error
  };
};
