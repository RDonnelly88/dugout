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
      
      // Filter to include only players who have played at least one match
      const activePlayers = seasonPlayerStats.filter(s => s.played > 0);
      
      // Sort by points (descending), then by games played (ascending if points are equal), then wins (descending)
      const sortedStats = [...activePlayers].sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // Prioritize fewer games played when points are equal
        if (a.played !== b.played) {
          return a.played - b.played;
        }
        return b.wins - a.wins;
      });
      
      // Golf-style ranking: players with identical stats share the same rank
      const ranks: Record<string, number> = {};
      let currentRank = 1;
      
      // First player always gets rank 1
      if (sortedStats.length > 0) {
        ranks[sortedStats[0].playerId] = currentRank;
      }
      
      // Calculate ranks for the rest of the players
      for (let i = 1; i < sortedStats.length; i++) {
        const prevPlayer = sortedStats[i - 1];
        const currentPlayer = sortedStats[i];
        
        // If current player has same stats as previous, they get the same rank
        if (
          prevPlayer.points === currentPlayer.points && 
          prevPlayer.played === currentPlayer.played && 
          prevPlayer.wins === currentPlayer.wins
        ) {
          ranks[currentPlayer.playerId] = ranks[prevPlayer.playerId];
        } else {
          // Otherwise, current rank is i+1 (position in the sorted array)
          currentRank = i + 1;
          ranks[currentPlayer.playerId] = currentRank;
        }
      }
      
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
