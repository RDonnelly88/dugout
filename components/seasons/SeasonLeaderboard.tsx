import Link from "next/link";
import React from "react";

import { Trophy, Medal, Ghost } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { SeasonPlayerStats, PlayerFormResult } from "@/types";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import { calculatePlayerRanks, sortPlayersByRank } from "@/lib/ranking-utils";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";

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
  
  // Filter out players with zero matches played
  const activeStats = stats.filter(player => player.played > 0);
  
  // Sort stats using our shared utility function
  const sortedStats = sortPlayersByRank(activeStats);
  
  // Calculate ranks using golf-style ranking from our shared utility
  const playerRanks = calculatePlayerRanks(activeStats);
  
  // Limit the number of players shown if requested
  const displayStats = limit ? sortedStats.slice(0, limit) : sortedStats;
  
  // Get player IDs for batch loading
  const playerIds = displayStats.map(player => player.playerId);
  
  // Use the batch loading hook for real-time data
  const { formData, isLoading: isLoadingForms } = useBatchFormLoader(
    seasonId || null, 
    seasonId ? playerIds : []
  );
  
  // Combine provided forms with batch loaded forms - prioritize fresh data from the hook
  const combinedForms = { ...playerForms, ...formData };
  
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
            {displayStats.map((stat) => (
              <TableRow key={stat.playerId}>
                <TableCell className="font-medium">{playerRanks[stat.playerId]}</TableCell>
                <TableCell>
                  <Link href={`/players/${stat.playerId}`} className="flex items-center space-x-2 hover:underline">
                    <Avatar className="h-8 w-8 bg-gray-800">
                      <AvatarImage src={stat.playerImage ?? undefined} alt={stat.playerName} />
                      <AvatarFallback>
                        {stat.playerImage ? stat.playerName.charAt(0) : <Ghost className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {stat.playerName}
                        <PlayerSeasonStars playerId={stat.playerId} size="sm" />
                      </div>
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
