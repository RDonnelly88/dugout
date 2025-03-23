
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
import { Badge } from "@/components/ui/badge";
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
        <h1 className="page-title text-4xl font-bold text-gradient mb-2">Football Tracker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your football matches and player statistics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 my-8">
        <div className="tech-panel animate-pop-in" style={{animationDelay: "0.1s"}}>
          <div className="tech-panel-header">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Players</h3>
          </div>
          <div className="tech-panel-content flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 cyber-glow">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold">{players.length}</div>
          </div>
        </div>
        
        <div className="tech-panel animate-pop-in" style={{animationDelay: "0.2s"}}>
          <div className="tech-panel-header">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Played Matches</h3>
          </div>
          <div className="tech-panel-content flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 cyber-glow">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold">{completedMatches}</div>
          </div>
        </div>
        
        <div className="tech-panel animate-pop-in" style={{animationDelay: "0.3s"}}>
          <div className="tech-panel-header">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Upcoming Matches</h3>
          </div>
          <div className="tech-panel-content flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 cyber-glow">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold">{scheduledMatches}</div>
          </div>
        </div>
      </div>

      {currentSeason ? (
        <div className="space-y-8">
          <div className="tech-panel animate-slide-up" style={{animationDelay: "0.4s"}}>
            <div className="tech-panel-header flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Current Season</h2>
                <p className="text-sm text-muted-foreground">{currentSeason.name}</p>
              </div>
              <Link to={`/seasons/${currentSeason.id}`}>
                <Button variant="outline" size="sm" className="cyber-button">
                  View Season
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="tech-panel-content">
              <div className="flex flex-wrap gap-4">
                <div className="tech-badge flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(currentSeason.startDate).toLocaleDateString()} - {currentSeason.endDate ? new Date(currentSeason.endDate).toLocaleDateString() : "Ongoing"}</span>
                </div>
                <div className="tech-badge flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{currentSeasonMatches.length} Matches</span>
                </div>
                <div className="tech-badge flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{seasonPlayerStats.length} Players</span>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-slide-up" style={{animationDelay: "0.5s"}}>
            <SeasonLeaderboard 
              stats={seasonPlayerStats}
              limit={5}
              seasonName={currentSeason.name}
              isFinished={currentSeason.isFinished}
              seasonId={currentSeason.id}
              playerForms={formData}
            />
          </div>
          
          <div className="flex justify-end animate-slide-up" style={{animationDelay: "0.6s"}}>
            <Link to={`/seasons/${currentSeason.id}`}>
              <Button variant="outline" className="cyber-button">
                View Full League Table
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="tech-panel animate-slide-up p-8 text-center" style={{animationDelay: "0.4s"}}>
          <h2 className="text-xl font-bold mb-2">No Current Season</h2>
          <p className="text-muted-foreground mb-6">Create a season to organize your matches and track player statistics.</p>
          <Button asChild className="cyber-button">
            <Link to="/seasons/create">Create Season</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
