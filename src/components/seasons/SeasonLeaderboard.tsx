import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Ghost } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { SeasonPlayerStats, PlayerFormResult } from "@/types";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import { useQueryClient } from "@tanstack/react-query";

interface SeasonLeaderboardProps {
  stats: SeasonPlayerStats[];
  seasonId?: string;
  playerForms?: Record<string, PlayerFormResult[]>;
  limit?: number;
  showTitle?: boolean;
  seasonName?: string;
  isFinished?: boolean;
}

const SeasonLeaderboard = ({ 
  stats, 
  seasonId,
  playerForms = {}, 
  limit, 
  showTitle = true,
  seasonName,
  isFinished = false
}: SeasonLeaderboardProps) => {
  const queryClient = useQueryClient();
  
  // Filter out players with zero matches played
  const activeStats = stats.filter(player => player.played > 0);
  
  // Sort stats by points (descending), then games played (descending if points are equal), then wins (descending)
  const sortedStats = [...activeStats].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // Prioritize MORE games played when points are equal
    if (a.played !== b.played) {
      return b.played - a.played;
    }
    return b.wins - a.wins;
  });
  
  // Calculate ranks using golf-style ranking
  const playerRanks: Record<string, number> = {};
  let currentRank = 1;
  
  // First player always gets rank 1
  if (sortedStats.length > 0) {
    playerRanks[sortedStats[0].playerId] = currentRank;
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
      playerRanks[currentPlayer.playerId] = playerRanks[prevPlayer.playerId];
    } else {
      // Otherwise, current rank is i+1 (position in the sorted array)
      currentRank = i + 1;
      playerRanks[currentPlayer.playerId] = currentRank;
    }
  }
  
  // Limit the number of players shown if requested
  const displayStats = limit ? sortedStats.slice(0, limit) : sortedStats;
  
  // Get player IDs for batch loading
  const playerIds = displayStats.map(player => player.playerId);
  
  // Ensure we have fresh data when the component renders
  useEffect(() => {
    if (seasonId && playerIds.length > 0) {
      console.log(`SeasonLeaderboard for season ${seasonId} rendered, forcing data refresh`);
      
      // Force immediate removal of any cached data
      queryClient.removeQueries({ queryKey: ['batchPlayerForms', seasonId, playerIds] });
      
      // Schedule a fresh fetch (with small delay to avoid blocking UI)
      const fetchTimer = setTimeout(() => {
        queryClient.fetchQuery({ 
          queryKey: ['batchPlayerForms', seasonId, playerIds],
          queryFn: async () => {
            // This directly uses the service without caching
            const { getPlayerFormBatch } = await import('@/lib/player-form-service');
            return getPlayerFormBatch(seasonId, playerIds);
          },
          staleTime: 0
        });
      }, 50);
      
      return () => {
        clearTimeout(fetchTimer);
      };
    }
  }, [seasonId, JSON.stringify(playerIds)]);
  
  // Use the batch loading hook for real-time data
  const { formData, isLoading: isLoadingForms } = useBatchFormLoader(
    seasonId || null, 
    seasonId ? playerIds : []
  );
  
  // Combine provided forms with batch loaded forms - prioritize fresh data from the hook
  const combinedForms = { ...playerForms, ...formData };
  
  // Also refresh data when coming back to this tab/page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && seasonId && playerIds.length > 0) {
        console.log('Page became visible, refreshing player forms');
        
        // Force refetch of form data
        queryClient.removeQueries({ queryKey: ['batchPlayerForms', seasonId, playerIds] });
        queryClient.fetchQuery({ 
          queryKey: ['batchPlayerForms', seasonId, playerIds],
          queryFn: async () => {
            const { getPlayerFormBatch } = await import('@/lib/player-form-service');
            return getPlayerFormBatch(seasonId, playerIds);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [seasonId, JSON.stringify(playerIds)]);
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          <Trophy className="h-3 w-3 mr-1 text-amber-500" />
          {isFinished ? "Champion" : "Leader"}
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <Medal className="h-3 w-3 mr-1 text-slate-400" />
          2nd Place
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          <Medal className="h-3 w-3 mr-1 text-amber-700" />
          3rd Place
        </Badge>
      );
    }
    return null;
  };
  
  if (activeStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{showTitle ? (seasonName ? `${seasonName} League Table` : "League Table") : "No Data Available"}</CardTitle>
          {showTitle && (
            <CardDescription>
              No players with matches in this season yet.
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      {showTitle && (
        <CardHeader>
          <CardTitle>{seasonName ? `${seasonName} League Table` : "League Table"}</CardTitle>
          <CardDescription>
            Player rankings and statistics
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Form</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">W</TableHead>
              <TableHead className="text-right">D</TableHead>
              <TableHead className="text-right">L</TableHead>
              <TableHead className="text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStats.map((stat, index) => (
              <TableRow key={stat.playerId}>
                <TableCell className="font-medium">{playerRanks[stat.playerId]}</TableCell>
                <TableCell>
                  <Link to={`/players/${stat.playerId}`} className="flex items-center space-x-2 hover:underline">
                    <Avatar className="h-8 w-8 bg-gray-800">
                      <AvatarImage src={stat.playerImage} alt={stat.playerName} />
                      <AvatarFallback>
                        {stat.playerImage ? stat.playerName.charAt(0) : <Ghost className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{stat.playerName}</div>
                      {playerRanks[stat.playerId] <= 3 && <div className="md:hidden mt-1">{getRankBadge(playerRanks[stat.playerId])}</div>}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <PlayerFormDisplay 
                    results={combinedForms[stat.playerId] || []} 
                    size="sm" 
                    isLoading={isLoadingForms && !combinedForms[stat.playerId]}
                  />
                </TableCell>
                <TableCell className="text-right">{stat.played}</TableCell>
                <TableCell className="text-right">{stat.wins}</TableCell>
                <TableCell className="text-right">{stat.draws}</TableCell>
                <TableCell className="text-right">{stat.losses}</TableCell>
                <TableCell className="text-right font-bold">{stat.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SeasonLeaderboard;
