
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeasons } from "@/lib/db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Heart, Zap, Trophy, TrendingUp, TrendingDown, Swords, Shield, Crown, Flame, Snowflake, Star } from "lucide-react";
import { usePlayerRelationships, PlayerRelationshipsStats } from "@/hooks/usePlayerRelationships";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";

interface PlayerRelationshipsProps {
  playerId: string;
  playerName: string;
}

const PlayerRelationships: React.FC<PlayerRelationshipsProps> = ({ playerId, playerName }) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | "overall">("overall");
  const { stats, isLoading, enhancedStats, relationships } = usePlayerRelationships(playerId);
  
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

  const currentEnhancedStats = selectedSeasonId === "overall" ? enhancedStats : undefined;

  const hasData = !!(currentStats.bestTeammate || 
                   currentStats.worstTeammate || 
                   currentStats.mostFrequentTeammate || 
                   currentStats.toughestOpponent || 
                   currentStats.easiestOpponent);

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "best": return <Crown className="h-4 w-4 text-amber-400" />;
      case "worst": return <Snowflake className="h-4 w-4 text-blue-400" />;
      case "frequent": return <Heart className="h-4 w-4 text-pink-400" />;
      case "tough": return <Swords className="h-4 w-4 text-red-400" />;
      case "easy": return <Shield className="h-4 w-4 text-green-400" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 0.7) return "text-green-400";
    if (winRate >= 0.5) return "text-amber-400";
    return "text-red-400";
  };

  const renderPlayerCard = (
    title: string, 
    description: string, 
    relationship?: PlayerRelationshipsStats["bestTeammate"],
    type: string = "",
    showExtendedStats: boolean = false
  ) => {
    if (!relationship) {
      return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {getRelationshipIcon(type)}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="text-gray-400">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Not enough data
            </div>
          </CardContent>
        </Card>
      );
    }

    const isTeammate = title.includes("Teammate");
    const winRate = isTeammate ? relationship.winRateWithSameTeam : relationship.winRateAgainst;
    const matches = isTeammate ? relationship.matchesWithSameTeam : relationship.matchesAsOpponent;
    const wins = isTeammate ? relationship.winsWithSameTeam : relationship.winsAgainst;

    return (
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRelationshipIcon(type)}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {matches} matches
            </Badge>
          </div>
          <CardDescription className="text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link 
            to={`/players/${relationship.playerId}`} 
            className="block hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-300 group-hover:bg-gray-800/30"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-gray-600 group-hover:ring-gray-500 transition-all">
                  <AvatarImage src={relationship.playerImage} alt={relationship.playerName} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {relationship.playerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  <PlayerSeasonStars playerId={relationship.playerId} size="sm" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg truncate">{relationship.playerName}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Win Rate</span>
                    <span className={`text-sm font-bold ${getWinRateColor(winRate)}`}>
                      {Math.round(winRate * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={winRate * 100} 
                    className="h-2 bg-gray-800" 
                    indicatorClassName={`transition-all ${
                      winRate >= 0.7 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      winRate >= 0.5 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{wins}</div>
                      <div className="text-xs text-gray-500">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{matches}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    if (!currentEnhancedStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-blue-400">{currentEnhancedStats.totalUniqueTeammates}</div>
            <div className="text-sm text-blue-300">Unique Teammates</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <div className="text-2xl font-bold text-red-400">{currentEnhancedStats.totalUniqueOpponents}</div>
            <div className="text-sm text-red-300">Unique Opponents</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-green-400">
              {Math.round(currentEnhancedStats.overallTeammateWinRate * 100)}%
            </div>
            <div className="text-sm text-green-300">Teammate Win Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-4 text-center">
            <Swords className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(currentEnhancedStats.overallOpponentWinRate * 100)}%
            </div>
            <div className="text-sm text-purple-300">vs Opponents Win Rate</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStrengthsWeaknesses = () => {
    if (!currentEnhancedStats) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-green-900/10 to-green-800/10 border-green-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Flame className="h-5 w-5" />
              Strengths
            </CardTitle>
            <CardDescription className="text-green-300/80">
              Opponents you dominate (70%+ win rate against)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentEnhancedStats.dominantOpponents.slice(0, 3).map((opponent, index) => (
              <div key={opponent.playerId} className="flex items-center justify-between p-2 bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-green-400">#{index + 1}</div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={opponent.playerImage} />
                    <AvatarFallback className="text-xs">{opponent.playerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{opponent.playerName}</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {Math.round(opponent.winRateAgainst * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/10 to-red-800/10 border-red-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Snowflake className="h-5 w-5" />
              Challenges
            </CardTitle>
            <CardDescription className="text-red-300/80">
              Opponents that give you trouble (40% or lower win rate against)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentEnhancedStats.strugglingAgainst.slice(0, 3).map((opponent, index) => (
              <div key={opponent.playerId} className="flex items-center justify-between p-2 bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-red-400">#{index + 1}</div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={opponent.playerImage} />
                    <AvatarFallback className="text-xs">{opponent.playerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{opponent.playerName}</span>
                </div>
                <Badge variant="outline" className="text-red-400 border-red-400">
                  {Math.round(opponent.winRateAgainst * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Relationships</CardTitle>
          <CardDescription>Loading comprehensive player statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-[100px] rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer h-[200px] rounded-lg" />
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-400" />
              Player Relationships
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of {playerName}'s interactions with other players
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
          <div className="text-center py-8">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <p className="text-muted-foreground text-lg">
              Not enough match data to display relationships for {selectedSeasonId === "overall" ? "all seasons" : seasons.find(s => s.id === selectedSeasonId)?.name}
            </p>
          </div>
        ) : (
          <div>
            {renderOverviewStats()}
            {renderStrengthsWeaknesses()}
            
            <Tabs defaultValue="teammates" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="teammates" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Teammates
                </TabsTrigger>
                <TabsTrigger value="opponents" className="flex items-center gap-2">
                  <Swords className="h-4 w-4" />
                  Opponents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="teammates" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {renderPlayerCard(
                  "Most Frequent Teammate", 
                  "Player who has been on the same team most often",
                  currentStats.mostFrequentTeammate,
                  "frequent"
                )}
                {renderPlayerCard(
                  "Best Teammate", 
                  "Highest win rate when playing together",
                  currentStats.bestTeammate,
                  "best"
                )}
                {renderPlayerCard(
                  "Challenging Teammate", 
                  "Lowest win rate when playing together",
                  currentStats.worstTeammate,
                  "worst"
                )}
              </TabsContent>
              
              <TabsContent value="opponents" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderPlayerCard(
                  "Toughest Opponent", 
                  "Player with the lowest win rate against",
                  currentStats.toughestOpponent,
                  "tough"
                )}
                {renderPlayerCard(
                  "Easiest Opponent", 
                  "Player with the highest win rate against",
                  currentStats.easiestOpponent,
                  "easy"
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerRelationships;
