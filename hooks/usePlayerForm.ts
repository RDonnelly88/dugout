
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason } from "@/lib/player-form-service";


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
