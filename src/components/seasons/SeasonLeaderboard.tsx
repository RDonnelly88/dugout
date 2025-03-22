import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { SeasonPlayerStats, PlayerFormResult } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useBatchPlayerForms } from "@/hooks/usePlayerForm";

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
  
  // Sort stats by points (descending), then wins (descending)
  const sortedStats = [...activeStats].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.wins - a.wins;
  });
  
  // Limit the number of players shown if requested
  const displayStats = limit ? sortedStats.slice(0, limit) : sortedStats;
  
  // Get player IDs for batch loading
  const playerIds = displayStats.map(player => player.playerId);
  
  // Use the batch loading hook if seasonId is provided
  const { forms: batchForms, isLoading: isLoadingForms } = useBatchPlayerForms(
    seasonId || null, 
    seasonId ? playerIds : []
  );
  
  // Combine provided forms with batch loaded forms
  const combinedForms = { ...playerForms, ...batchForms };
  
  // Prefetch individual player forms for when users navigate to player details
  useEffect(() => {
    if (seasonId && displayStats.length > 0) {
      displayStats.forEach(player => {
        queryClient.prefetchQuery({
          queryKey: ['playerForm', seasonId, player.playerId],
          queryFn: () => import('@/lib/db').then(m => m.getPlayerFormInSeason(seasonId, player.playerId))
        });
      });
    }
  }, [seasonId, displayStats, queryClient]);
  
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          <Trophy className="h-3 w-3 mr-1 text-amber-500" />
          {isFinished ? "Champion" : "Leader"}
        </Badge>
      );
    }
    if (index === 1) {
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <Medal className="h-3 w-3 mr-1 text-slate-400" />
          2nd Place
        </Badge>
      );
    }
    if (index === 2) {
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
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <Link to={`/players/${stat.playerId}`} className="flex items-center space-x-2 hover:underline">
                    <Avatar className="h-8 w-8 bg-gray-800">
                      {stat.playerImage ? (
                        stat.playerImage.startsWith('icon:') ? (
                          <AvatarImage iconName={stat.playerImage.replace('icon:', '')} />
                        ) : (
                          <AvatarImage src={stat.playerImage} alt={stat.playerName} />
                        )
                      ) : (
                        <AvatarImage iconName="Ghost" />
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">{stat.playerName}</div>
                      {index < 3 && <div className="md:hidden mt-1">{getRankBadge(index)}</div>}
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
