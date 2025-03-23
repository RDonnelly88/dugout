
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  getCurrentSeason,
  getSeasonPlayerStats,
  getMatches,
  getPlayers
} from "@/lib/db";
import { ArrowRight, Trophy, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";

const Home = () => {
  // Get the current season
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });

  // Get all matches
  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  });

  // Get all players
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  // Get season player stats if a current season exists
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ['seasonPlayerStats', currentSeason?.id],
    queryFn: () => getSeasonPlayerStats(currentSeason!.id),
    enabled: !!currentSeason
  });
  
  // Get player IDs for batch form loading
  const playerIds = seasonPlayerStats
    .filter(player => player.played > 0)
    .slice(0, 5)
    .map(player => player.playerId);
  
  // Preload form data for top players
  const { formData } = useBatchFormLoader(
    currentSeason?.id || null,
    currentSeason ? playerIds : []
  );

  // Filter current season matches
  const currentSeasonMatches = currentSeason 
    ? matches.filter(match => match.seasonId === currentSeason.id)
    : [];

  // Calculate overall stats
  const completedMatches = matches.filter(match => match.status === "completed").length;
  const scheduledMatches = matches.filter(match => match.status === "scheduled").length;

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title text-gradient">Football Tracker</h1>
        <p className="mt-2 text-muted-foreground">
          Track your football matches and player statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Played Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMatches}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledMatches}</div>
          </CardContent>
        </Card>
      </div>

      {currentSeason ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current Season</CardTitle>
                  <CardDescription>{currentSeason.name}</CardDescription>
                </div>
                <Link to={`/seasons/${currentSeason.id}`}>
                  <Button variant="outline" size="sm">
                    View Season
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(currentSeason.startDate).toLocaleDateString()} - {currentSeason.endDate ? new Date(currentSeason.endDate).toLocaleDateString() : "Ongoing"}</span>
                </div>
                <div className="flex items-center p-2 bg-green-50 text-green-700 rounded-lg">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span>{currentSeasonMatches.length} Matches</span>
                </div>
                <div className="flex items-center p-2 bg-purple-50 text-purple-700 rounded-lg">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{seasonPlayerStats.length} Players</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <SeasonLeaderboard 
            stats={seasonPlayerStats}
            limit={5}
            seasonName={currentSeason.name}
            isFinished={currentSeason.isFinished}
            seasonId={currentSeason.id}
            playerForms={formData}
          />
          
          <div className="flex justify-end">
            <Link to={`/seasons/${currentSeason.id}`}>
              <Button variant="outline">
                View Full League Table
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-medium mb-2">No Current Season</h2>
            <p className="text-muted-foreground mb-4">Create a season to organize your matches and track player statistics.</p>
            <Button asChild>
              <Link to="/seasons/create">Create Season</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
