
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason } from "@/lib/db";
import { PlayerFormResult } from "@/types";

export const usePlayerForm = (seasonId: string | null, playerId: string | null) => {
  const { data: form = [], isLoading, error } = useQuery({
    queryKey: ['playerForm', seasonId, playerId],
    queryFn: () => getPlayerFormInSeason(seasonId!, playerId!),
    enabled: !!seasonId && !!playerId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  console.log("Player form data for", playerId, "in season", seasonId, ":", form);
  
  return {
    form,
    isLoading,
    error
  };
};
