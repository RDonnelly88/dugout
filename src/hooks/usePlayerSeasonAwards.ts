
import { useQuery } from "@tanstack/react-query";
import { getSeasonChampions, getSeasons } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";

export const usePlayerSeasonAwards = () => {
  const { currentTeam } = useTeam();

  const { data: champions = [], isLoading: isLoadingChampions } = useQuery({
    queryKey: ['seasonChampions', currentTeam?.id],
    queryFn: () => getSeasonChampions(),
    enabled: !!currentTeam
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons', currentTeam?.id],
    queryFn: () => getSeasons(),
    enabled: !!currentTeam
  });

  // Get finished seasons only
  const finishedSeasons = seasons.filter(season => season.isFinished);
  const finishedSeasonIds = new Set(finishedSeasons.map(s => s.id));

  // Count awards for each player (only finished seasons)
  const playerSeasonAwards: Record<string, { gold: number; silver: number; bronze: number }> = {};
  
  champions.forEach(champion => {
    // Only count awards from finished seasons
    if (finishedSeasonIds.has(champion.seasonId)) {
      if (!playerSeasonAwards[champion.playerId]) {
        playerSeasonAwards[champion.playerId] = { gold: 0, silver: 0, bronze: 0 };
      }
      
      if (champion.rank === 1) {
        playerSeasonAwards[champion.playerId].gold += 1;
      } else if (champion.rank === 2) {
        playerSeasonAwards[champion.playerId].silver += 1;
      } else if (champion.rank === 3) {
        playerSeasonAwards[champion.playerId].bronze += 1;
      }
    }
  });

  return {
    playerSeasonAwards,
    isLoading: isLoadingChampions || isLoadingSeasons
  };
};
