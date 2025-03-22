import { SeasonPlayerStats, SeasonChampion } from "@/types";

/**
 * Calculate golf-style player rankings based on points, games played, and wins
 * Players with identical stats share the same rank
 * @param players Array of player stats (either SeasonPlayerStats or SeasonChampion)
 * @returns Object mapping player IDs to their ranks
 */
export const calculatePlayerRanks = <T extends SeasonPlayerStats | SeasonChampion>(
  players: T[]
): Record<string, number> => {
  // Filter out players with zero matches played
  const activePlayers = players.filter(player => player.played > 0);
  
  // Sort by points (descending), then games played (descending if points are equal), then wins
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // Prioritize MORE games played when points are equal
    if (a.played !== b.played) {
      return b.played - a.played;
    }
    return b.wins - a.wins;
  });
  
  const playerRanks: Record<string, number> = {};
  let currentRank = 1;
  
  // First player always gets rank 1
  if (sortedPlayers.length > 0) {
    playerRanks[sortedPlayers[0].playerId] = currentRank;
  }
  
  // Calculate ranks for the rest of the players
  for (let i = 1; i < sortedPlayers.length; i++) {
    const prevPlayer = sortedPlayers[i - 1];
    const currentPlayer = sortedPlayers[i];
    
    // If current player has same stats as previous, they get the same rank
    if (
      prevPlayer.points === currentPlayer.points && 
      prevPlayer.played === currentPlayer.played && 
      prevPlayer.wins === currentPlayer.wins
    ) {
      playerRanks[currentPlayer.playerId] = playerRanks[prevPlayer.playerId];
    } else {
      // Otherwise, current rank is i+1 (position in the sorted array)
      currentRank = i + 1;
      playerRanks[currentPlayer.playerId] = currentRank;
    }
  }
  
  return playerRanks;
};

/**
 * Sort players by rank (using the golf-style ranking logic)
 * @param players Array of player stats
 * @returns Sorted array of players
 */
export const sortPlayersByRank = <T extends SeasonPlayerStats | SeasonChampion>(
  players: T[]
): T[] => {
  // Filter out players with zero matches played
  const activePlayers = players.filter(player => player.played > 0);
  
  // Sort by points, then games played, then wins
  return [...activePlayers].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // Prioritize MORE games played when points are equal
    if (a.played !== b.played) {
      return b.played - a.played;
    }
    return b.wins - a.wins;
  });
};
