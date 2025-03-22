
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason } from "@/lib/player-form-service";
import { PlayerFormResult } from "@/types";

// Single player form loading hook
export const usePlayerForm = (seasonId: string | null, playerId: string | null) => {
  const { data: form = [], isLoading, error } = useQuery({
    queryKey: ['playerForm', seasonId, playerId],
    queryFn: () => getPlayerFormInSeason(seasonId!, playerId!),
    enabled: !!seasonId && !!playerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  return {
    form,
    isLoading,
    error
  };
};

// Batch form loading hook for multiple players
export const useBatchPlayerForms = (seasonId: string | null, playerIds: string[] = []) => {
  const { data: batchForms = {}, isLoading, error } = useQuery({
    queryKey: ['batchPlayerForms', seasonId, playerIds],
    queryFn: async () => {
      if (!seasonId || playerIds.length === 0) return {};
      
      const formsMap: Record<string, PlayerFormResult[]> = {};
      
      // Use Promise.all to fetch all player forms in parallel
      await Promise.all(
        playerIds.map(async (playerId) => {
          try {
            const form = await getPlayerFormInSeason(seasonId, playerId);
            formsMap[playerId] = form;
          } catch (error) {
            console.error(`Error loading form for player ${playerId}:`, error);
            formsMap[playerId] = [];
          }
        })
      );
      
      return formsMap;
    },
    enabled: !!seasonId && playerIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  return {
    forms: batchForms,
    isLoading,
    error
  };
};
