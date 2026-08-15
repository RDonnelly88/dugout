
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-browser";

interface PositionHistoryPoint {
  matchId: string;
  matchDate: string;
  position: number;
  playerId: string;
  playerName: string;
  playerImage?: string;
}

export interface PlayerPositionHistory {
  playerId: string;
  playerName: string;
  playerImage?: string;
  history: PositionHistoryPoint[];
}

export const usePlayerPositionHistory = (seasonId: string | null) => {
  return useQuery({
    queryKey: ['playerPositionHistory', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      
      console.log(`Fetching position history for season ${seasonId}`);
      
      // Get all completed matches for this season, ordered by date
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("season_id", seasonId)
        .eq("status", "completed")
        .order("date", { ascending: true });
      
      if (matchesError) {
        console.error("Error fetching matches for position history:", matchesError);
        return [];
      }
      
      // No matches, return empty data
      if (!matchesData || matchesData.length === 0) {
        return [];
      }
      
      // Get all players who participated in these matches
      const allPlayers = new Set<string>();
      matchesData.forEach(match => {
        try {
          const teamA = typeof match.team_a === 'string' ? JSON.parse(match.team_a) : match.team_a;
          const teamB = typeof match.team_b === 'string' ? JSON.parse(match.team_b) : match.team_b;
          
          if (teamA && Array.isArray(teamA.players)) {
            teamA.players.forEach((playerId: string) => allPlayers.add(playerId));
          }
          
          if (teamB && Array.isArray(teamB.players)) {
            teamB.players.forEach((playerId: string) => allPlayers.add(playerId));
          }
        } catch (e) {
          console.error("Error parsing team data:", e);
        }
      });
      
      // Get player details
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id, name, image")
        .in("id", Array.from(allPlayers));
      
      if (playersError) {
        console.error("Error fetching player details:", playersError);
        return [];
      }
      
      // Create a map of player stats after each match
      const playerStats = new Map<string, { 
        wins: number; 
        draws: number; 
        losses: number; 
        points: number;
        played: number;
        name: string;
        image?: string;
      }>();
      
      // Initialize player stats
      playersData?.forEach(player => {
        playerStats.set(player.id, {
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0,
          played: 0,
          name: player.name,
          image: player.image ?? undefined
        });
      });
      
      // Track position history for each player
      const positionHistory: Record<string, PositionHistoryPoint[]> = {};
      
      // Process each match to update stats and calculate positions
      matchesData.forEach(match => {
        try {
          const matchDate = match.date;
          const teamA = typeof match.team_a === 'string' ? JSON.parse(match.team_a) : match.team_a;
          const teamB = typeof match.team_b === 'string' ? JSON.parse(match.team_b) : match.team_b;
          
          // Skip if the match doesn't have valid teams or scores
          if (!teamA || !teamB || teamA.score === undefined || teamB.score === undefined) {
            return;
          }
          
          // Update stats for players in team A
          if (Array.isArray(teamA.players)) {
            teamA.players.forEach((playerId: string) => {
              const playerStat = playerStats.get(playerId);
              if (playerStat) {
                playerStat.played += 1;
                
                if (teamA.score > teamB.score) {
                  playerStat.wins += 1;
                  playerStat.points += 3;
                } else if (teamA.score === teamB.score) {
                  playerStat.draws += 1;
                  playerStat.points += 1;
                } else {
                  playerStat.losses += 1;
                }
              }
            });
          }
          
          // Update stats for players in team B
          if (Array.isArray(teamB.players)) {
            teamB.players.forEach((playerId: string) => {
              const playerStat = playerStats.get(playerId);
              if (playerStat) {
                playerStat.played += 1;
                
                if (teamB.score > teamA.score) {
                  playerStat.wins += 1;
                  playerStat.points += 3;
                } else if (teamB.score === teamA.score) {
                  playerStat.draws += 1;
                  playerStat.points += 1;
                } else {
                  playerStat.losses += 1;
                }
              }
            });
          }
          
          // Sort players by points to determine positions
          const sortedPlayers = Array.from(playerStats.entries())
            .filter(([_, stats]) => stats.played > 0) // Only include players who have played
            .sort(([, statsA], [, statsB]) => {
              // Sort by points (descending), then games played (descending if points are equal), then wins (descending)
              if (statsB.points !== statsA.points) {
                return statsB.points - statsA.points;
              }
              // Prioritize MORE games played when points are equal
              if (statsA.played !== statsB.played) {
                return statsB.played - statsA.played;
              }
              return statsB.wins - statsA.wins;
            });
          
          // Calculate golf-style ranks
          const playerRanks: Record<string, number> = {};
          let currentRank = 1;
          
          // First player always gets rank 1
          if (sortedPlayers.length > 0) {
            playerRanks[sortedPlayers[0][0]] = currentRank; // sortedPlayers[0][0] is the playerId
          }
          
          // Calculate ranks for the rest of the players
          for (let i = 1; i < sortedPlayers.length; i++) {
            const prevPlayer = sortedPlayers[i - 1];
            const currentPlayer = sortedPlayers[i];
            const [prevPlayerId, prevStats] = prevPlayer;
            const [currentPlayerId, currentStats] = currentPlayer;
            
            // If current player has same stats as previous, they get the same rank
            if (
              prevStats.points === currentStats.points && 
              prevStats.played === currentStats.played && 
              prevStats.wins === currentStats.wins
            ) {
              playerRanks[currentPlayerId] = playerRanks[prevPlayerId];
            } else {
              // Otherwise, current rank is i+1 (position in the sorted array)
              currentRank = i + 1;
              playerRanks[currentPlayerId] = currentRank;
            }
          }
          
          // Record positions for each player
          sortedPlayers.forEach(([playerId, stats]) => {
            if (!positionHistory[playerId]) {
              positionHistory[playerId] = [];
            }
            
            positionHistory[playerId].push({
              matchId: match.id,
              matchDate,
              position: playerRanks[playerId], // Use the calculated rank
              playerId,
              playerName: stats.name,
              playerImage: stats.image
            });
          });
        } catch (e) {
          console.error("Error processing match for position history:", e);
        }
      });
      
      // Convert to array format expected by the chart
      const result: PlayerPositionHistory[] = Object.entries(positionHistory).map(
        ([playerId, history]) => {
          const player = playerStats.get(playerId);
          return {
            playerId,
            playerName: player?.name || "Unknown Player",
            playerImage: player?.image,
            history: history.sort((a, b) => 
              new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
            )
          };
        }
      );
      
      return result;
    },
    enabled: !!seasonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
