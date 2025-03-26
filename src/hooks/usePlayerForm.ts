
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason, getPlayerFormBatch } from "@/lib/player-form-service";
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
      
      return getPlayerFormBatch(seasonId, playerIds);
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
