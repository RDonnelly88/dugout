
import { useQuery } from "@tanstack/react-query";
import { getSeasonChampions } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";

export const usePlayerSeasonWins = () => {
  const { currentTeam } = useTeam();

  const { data: champions = [], isLoading } = useQuery({
    queryKey: ['seasonChampions', currentTeam?.id],
    queryFn: () => getSeasonChampions(),
    enabled: !!currentTeam
  });

  // Count wins for each player (only finished seasons where they ranked #1)
  const playerSeasonWins: Record<string, number> = {};
  
  champions.forEach(champion => {
    // Only count as a win if they were rank 1 in a finished season
    if (champion.rank === 1) {
      playerSeasonWins[champion.playerId] = (playerSeasonWins[champion.playerId] || 0) + 1;
    }
  });

  return {
    playerSeasonWins,
    isLoading
  };
};
