
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSeasonPlayerStats } from "@/lib/db";
import { SeasonPlayerStats } from "@/types";

interface PlayerRankResult {
  rank: number | null;
  hasPlayedCurrentSeason: boolean;
  isLoading: boolean;
}

/**
 * Hook to calculate a player's rank in a given season
 * Returns consistent rank information across the application
 */
export const usePlayerRank = (
  seasonId: string | null, 
  playerId: string | null
): PlayerRankResult => {
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [hasPlayedCurrentSeason, setHasPlayedCurrentSeason] = useState<boolean>(false);

  // Fetch all player stats for the season to calculate rank
  const { data: seasonPlayerStats = [], isLoading } = useQuery({
    queryKey: ['seasonPlayerStats', seasonId],
    queryFn: () => seasonId ? getSeasonPlayerStats(seasonId) : Promise.resolve([]),
    enabled: !!seasonId && !!playerId
  });

  // Calculate player rank whenever season stats change
  useEffect(() => {
    if (playerId && seasonId && seasonPlayerStats.length > 0) {
      // Check if player has played in the season
      const playerSeasonStats = seasonPlayerStats.find(s => s.playerId === playerId);
      const hasPlayed = !!playerSeasonStats && playerSeasonStats.played > 0;
      setHasPlayedCurrentSeason(hasPlayed);
      
      if (!hasPlayed) {
        setPlayerRank(null);
        return;
      }
      
      // Filter to include only players who have played at least one match
      const activePlayers = seasonPlayerStats.filter(s => s.played > 0);
      
      // Sort by points (descending), then by wins if points are equal
      const sortedStats = [...activePlayers].sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.wins - a.wins;
      });
      
      // Find the player's position in the sorted array
      const playerIndex = sortedStats.findIndex(s => s.playerId === playerId);
      setPlayerRank(playerIndex !== -1 ? playerIndex + 1 : null);
    } else {
      setPlayerRank(null);
      setHasPlayedCurrentSeason(false);
    }
  }, [seasonPlayerStats, playerId, seasonId]);

  return { 
    rank: playerRank, 
    hasPlayedCurrentSeason, 
    isLoading 
  };
};
