
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Trophy, Users, LayoutGrid, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PlayerForm from "@/components/players/PlayerForm";
import { Season, SeasonChampion, PlayerFormResult } from "@/types";

interface SeasonCardProps {
  season: Season;
  champions?: SeasonChampion[];
  totalPlayers: number;
  totalMatches: number;
  playerForms?: Record<string, PlayerFormResult[]>;
}

const SeasonCard = ({ 
  season, 
  champions = [], 
  totalPlayers, 
  totalMatches,
  playerForms = {}
}: SeasonCardProps) => {
  const topPlayer = champions.length > 0 ? champions[0] : null;
  const startDate = new Date(season.startDate).toLocaleDateString();
  const endDate = season.endDate ? new Date(season.endDate).toLocaleDateString() : "Ongoing";
  
  // Sort champions by rank or points if available
  const sortedChampions = [...champions].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return b.points - a.points;
  });
  
  // Take top 5 for mini leaderboard
  const top5Players = sortedChampions.slice(0, 5);

  return (
    <Link to={`/seasons/${season.id}`}>
      <Card className="overflow-hidden hover:bg-muted/20 transition-colors h-full bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold mb-2">{season.name}</h3>
              {season.isCurrent && (
                <Badge className="bg-green-500 hover:bg-green-600">Current Season</Badge>
              )}
              {season.isFinished && (
                <Badge variant="outline">Finished</Badge>
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{startDate} - {endDate}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-muted/20 rounded text-center">
                <div className="text-xs text-muted-foreground">Matches</div>
                <div className="font-semibold">{totalMatches}</div>
              </div>
              <div className="p-2 bg-muted/20 rounded text-center">
                <div className="text-xs text-muted-foreground">Players</div>
                <div className="font-semibold">{totalPlayers}</div>
              </div>
            </div>
            
            {topPlayer && (
              <div className="flex items-center p-3 bg-muted/20 rounded">
                <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {season.isFinished ? "Champion" : "Leader"}
                  </div>
                  <div className="font-medium">{topPlayer.playerName}</div>
                </div>
                <div className="ml-auto">
                  <div className="text-xs text-muted-foreground">Points</div>
                  <div className="font-semibold text-right">{topPlayer.points}</div>
                </div>
              </div>
            )}
            
            {top5Players.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Top {Math.min(5, top5Players.length)} Players</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Form</TableHead>
                      <TableHead className="text-right">P</TableHead>
                      <TableHead className="text-right">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top5Players.map((player, index) => (
                      <TableRow key={player.playerId}>
                        <TableCell className="py-1">
                          {index === 0 ? (
                            <Trophy className="h-4 w-4 text-amber-400" />
                          ) : index === 1 ? (
                            <Medal className="h-4 w-4 text-slate-400" />
                          ) : index === 2 ? (
                            <Medal className="h-4 w-4 text-amber-700" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={player.playerImage} alt={player.playerName} />
                              <AvatarFallback>{player.playerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{player.playerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-1">
                          <PlayerForm 
                            form={playerForms[player.playerId] || []} 
                            size="xs" 
                          />
                        </TableCell>
                        <TableCell className="text-right py-1">
                          {player.played}
                        </TableCell>
                        <TableCell className="text-right py-1 font-medium">
                          {player.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeasonCard;
