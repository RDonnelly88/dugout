
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSeasonPlayerStats } from "@/lib/db";
import { SeasonPlayerStats } from "@/types";
import { calculatePlayerRanks } from "@/lib/ranking-utils";

interface PlayerRankResult {
  rank: number | null;
  hasPlayedCurrentSeason: boolean;
  isLoading: boolean;
}

/**
 * Hook to calculate a player's rank in a given season
 * Returns consistent rank information across the application
 * Uses golf-style ranking where identical stats share the same rank
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
      
      // Calculate player ranks using the shared utility function
      const ranks = calculatePlayerRanks(seasonPlayerStats);
      
      // Set the player's rank
      setPlayerRank(ranks[playerId] || null);
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
