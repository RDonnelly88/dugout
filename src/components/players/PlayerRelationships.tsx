
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeasons } from "@/lib/db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayerRelationships, PlayerRelationshipsStats } from "@/hooks/usePlayerRelationships";

interface PlayerRelationshipsProps {
  playerId: string;
  playerName: string;
}

const PlayerRelationships: React.FC<PlayerRelationshipsProps> = ({ playerId, playerName }) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | "overall">("overall");
  const { stats, isLoading } = usePlayerRelationships(playerId);
  
  // Get seasons for dropdown
  const { data: seasons = [] } = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons
  });

  const currentStats = selectedSeasonId === "overall" 
    ? stats 
    : { 
        bestTeammate: stats.bySeasonId?.[selectedSeasonId]?.bestTeammate,
        worstTeammate: stats.bySeasonId?.[selectedSeasonId]?.worstTeammate,
        mostFrequentTeammate: stats.bySeasonId?.[selectedSeasonId]?.mostFrequentTeammate,
        toughestOpponent: stats.bySeasonId?.[selectedSeasonId]?.toughestOpponent,
        easiestOpponent: stats.bySeasonId?.[selectedSeasonId]?.easiestOpponent
      };

  const hasData = !!(currentStats.bestTeammate || 
                   currentStats.worstTeammate || 
                   currentStats.mostFrequentTeammate || 
                   currentStats.toughestOpponent || 
                   currentStats.easiestOpponent);

  const renderPlayerCard = (title: string, description: string, relationship?: PlayerRelationshipsStats["bestTeammate"]) => {
    if (!relationship) {
      return (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              Not enough data
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={`/players/${relationship.playerId}`} className="flex items-center hover:bg-gray-800 p-2 rounded-md transition-colors">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={relationship.playerImage} alt={relationship.playerName} />
              <AvatarFallback>{relationship.playerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-base">{relationship.playerName}</div>
              
              {title.includes("Teammate") && (
                <div className="text-sm text-muted-foreground">
                  {relationship.matchesWithSameTeam} matches together • 
                  {relationship.winsWithSameTeam} wins • 
                  {Math.round(relationship.winRateWithSameTeam * 100)}% win rate
                </div>
              )}
              
              {title.includes("Opponent") && (
                <div className="text-sm text-muted-foreground">
                  {relationship.matchesAsOpponent} matches as opponents • 
                  {relationship.winsAgainst} wins • 
                  {Math.round(relationship.winRateAgainst * 100)}% win rate
                </div>
              )}
            </div>
          </Link>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Relationships</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-[120px] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>Player Relationships</CardTitle>
            <CardDescription>
              {playerName}'s statistics with other players
            </CardDescription>
          </div>
          
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Statistics</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Not enough match data to display relationships for {selectedSeasonId === "overall" ? "all seasons" : seasons.find(s => s.id === selectedSeasonId)?.name}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="teammates" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="teammates">Teammates</TabsTrigger>
              <TabsTrigger value="opponents">Opponents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teammates" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPlayerCard(
                "Most Frequent Teammate", 
                "Player who has been on the same team most often",
                currentStats.mostFrequentTeammate
              )}
              {renderPlayerCard(
                "Best Teammate", 
                "Highest win rate when playing together",
                currentStats.bestTeammate
              )}
              {renderPlayerCard(
                "Worst Teammate", 
                "Lowest win rate when playing together",
                currentStats.worstTeammate
              )}
            </TabsContent>
            
            <TabsContent value="opponents" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderPlayerCard(
                "Toughest Opponent", 
                "Player with the lowest win rate against",
                currentStats.toughestOpponent
              )}
              {renderPlayerCard(
                "Easiest Opponent", 
                "Player with the highest win rate against",
                currentStats.easiestOpponent
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerRelationships;
