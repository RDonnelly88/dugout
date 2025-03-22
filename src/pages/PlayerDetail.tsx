
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit, CalendarDays, Clock, Users, MapPin, Trophy, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePlayerDetail } from "@/hooks/usePlayerDetail";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import PlayerSeasonStats from "@/components/players/PlayerSeasonStats";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import PlayerRelationships from "@/components/players/PlayerRelationships";

const PlayerDetail = () => {
  const {
    player,
    playerMatches,
    seasons,
    seasonStats,
    selectedSeasonId,
    setSelectedSeasonId,
    selectedSeason,
    selectedSeasonStats,
    getPlayerMatchResult,
    isLoading,
    navigate
  } = usePlayerDetail();

  // Get player form for the currently selected season
  const { form: currentSeasonForm } = usePlayerForm(
    selectedSeasonId, 
    player?.id || null
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[200px] mb-8"></div>
        <div className="shimmer rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Player not found</h2>
          <p className="text-muted-foreground mt-2">This player may have been deleted.</p>
          <Button className="mt-4" asChild>
            <Link to="/players">View All Players</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Prepare player info card
  const playerRecentMatches = playerMatches
    .filter(match => match.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentResults = playerRecentMatches.map(match => getPlayerMatchResult(match).result);

  // Calculate player's rank in current season
  const currentSeasonStat = seasonStats.find(stat => 
    !selectedSeasonId ? stat.seasonId === seasons.find(s => s.isCurrent)?.id : stat.seasonId === selectedSeasonId
  );
  
  const playerRank = currentSeasonStat ? 
    seasonStats
      .filter(stat => stat.seasonId === currentSeasonStat.seasonId)
      .sort((a, b) => b.points - a.points)
      .findIndex(stat => stat.playerId === player.id) + 1 
    : null;

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/players/edit/${player.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </div>

      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-28 w-28">
              <AvatarImage src={player.image} alt={player.name} />
              <AvatarFallback className="text-4xl">{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  {player.stats.played} Matches
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {seasons.length} Seasons
                </Badge>
                {playerRank && (
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    <Trophy className="h-3 w-3 mr-1" />
                    Rank: #{playerRank}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Recent Form:
                </div>
                <PlayerFormDisplay results={currentSeasonForm.length > 0 ? currentSeasonForm : recentResults} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season stats summary card */}
      {currentSeasonStat && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-amber-400" />
              Current Season Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold">{currentSeasonStat.played}</div>
                <div className="text-sm text-blue-400">Played</div>
              </div>
              <div className="bg-green-900/20 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold">{currentSeasonStat.wins}</div>
                <div className="text-sm text-green-400">Wins</div>
              </div>
              <div className="bg-amber-900/20 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <MinusCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold">{currentSeasonStat.draws}</div>
                <div className="text-sm text-amber-400">Draws</div>
              </div>
              <div className="bg-red-900/20 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div className="text-2xl font-bold">{currentSeasonStat.losses}</div>
                <div className="text-sm text-red-400">Losses</div>
              </div>
            </div>
            <div className="mt-4 text-muted-foreground text-sm">
              <p>
                In the current season, {player.name} has {currentSeasonStat.points} points
                with a win rate of {Math.round((currentSeasonStat.wins / Math.max(1, currentSeasonStat.played)) * 100)}%.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="stats" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">All Stats</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <PlayerSeasonStats 
            playerName={player.name}
            overallStats={player.stats}
            seasonStats={seasonStats}
            onSeasonSelect={setSelectedSeasonId}
          />
        </TabsContent>
        
        <TabsContent value="relationships">
          <PlayerRelationships 
            playerId={player.id}
            playerName={player.name}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {selectedSeason ? `Matches in ${selectedSeason.name}` : 'All Matches'}
        </h2>

        {playerMatches.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              {selectedSeason 
                ? `No matches found for ${player.name} in the ${selectedSeason.name} season.` 
                : `No matches found for ${player.name}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {playerMatches
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((match) => {
                const { team, result } = getPlayerMatchResult(match);
                const playerTeam = team === 'A' ? match.teamA : match.teamB;
                const opposingTeam = team === 'A' ? match.teamB : match.teamA;
                const matchSeason = seasons.find(s => s.id === match.seasonId);
                
                return (
                  <Link to={`/matches/${match.id}`} key={match.id}>
                    <Card className="hover:bg-muted/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-lg font-medium">
                              {playerTeam.name} vs {opposingTeam.name}
                              {result && (
                                <Badge 
                                  className={`ml-2 ${
                                    result === 'win' 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : result === 'loss' 
                                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                >
                                  {result === 'win' ? 'Win' : result === 'loss' ? 'Loss' : 'Draw'}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                {new Date(match.date).toLocaleDateString()}
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {match.status === 'completed' ? 'Completed' : 'Scheduled'}
                              </div>
                              
                              {match.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {match.location}
                                </div>
                              )}
                              
                              {matchSeason && (
                                <Badge variant="outline" className="text-xs">
                                  {matchSeason.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {match.status === 'completed' && match.teamA.score !== undefined && match.teamB.score !== undefined && (
                            <div className="text-xl font-bold">
                              {match.teamA.score} - {match.teamB.score}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetail;
