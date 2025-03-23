
import React, { useEffect, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";

const Home = () => {
  const [loaded, setLoaded] = useState(false);
  
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
  
  // Trigger animations after component mount
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-container relative min-h-screen overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Base overlay */}
        <div className="absolute inset-0 bg-black opacity-80"></div>
        
        {/* Large glowing orbs - much larger and more visible */}
        <div className={`absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] ${loaded ? 'animate-pulse' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[100px] ${loaded ? 'animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '1s' }}></div>
        
        {/* Tech grid overlay */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(45, 212, 191, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.1) 1px, transparent 1px)', 
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Highly visible light streaks */}
        <div className={`absolute h-[3px] w-[500px] bg-gradient-to-r from-transparent via-primary to-transparent top-[20%] -left-[250px] ${loaded ? 'animate-slide-in-right' : 'opacity-0'}`}></div>
        <div className={`absolute h-[3px] w-[400px] bg-gradient-to-r from-transparent via-primary to-transparent top-[40%] -left-[200px] ${loaded ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute h-[3px] w-[600px] bg-gradient-to-r from-transparent via-accent to-transparent top-[60%] -left-[300px] ${loaded ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '1s' }}></div>
        
        {/* Scanner animation */}
        <div className={`absolute inset-0 overflow-hidden ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanner"></div>
        </div>
        
        {/* Floating particles */}
        {loaded && Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              backgroundColor: i % 2 === 0 ? 'rgba(45, 212, 191, 0.8)' : 'rgba(20, 184, 166, 0.8)',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="page-header">
          <h1 className={`page-title text-4xl font-bold text-gradient mb-2 ${loaded ? 'animate-glow' : ''}`}>Football Tracker</h1>
          <p className={`text-muted-foreground max-w-2xl mx-auto transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            Track your football matches and player statistics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 my-8">
          <div className={`tech-panel ${loaded ? 'animate-pop-in' : 'opacity-0'}`} style={{animationDelay: "0.1s"}}>
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
          
          <div className={`tech-panel ${loaded ? 'animate-pop-in' : 'opacity-0'}`} style={{animationDelay: "0.2s"}}>
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
          
          <div className={`tech-panel ${loaded ? 'animate-pop-in' : 'opacity-0'}`} style={{animationDelay: "0.3s"}}>
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
            <div className={`tech-panel ${loaded ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: "0.4s"}}>
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

            <div className={`${loaded ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: "0.5s"}}>
              <SeasonLeaderboard 
                stats={seasonPlayerStats}
                limit={5}
                seasonName={currentSeason.name}
                isFinished={currentSeason.isFinished}
                seasonId={currentSeason.id}
                playerForms={formData}
              />
            </div>
            
            <div className={`flex justify-end ${loaded ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: "0.6s"}}>
              <Link to={`/seasons/${currentSeason.id}`}>
                <Button variant="outline" className="cyber-button">
                  View Full League Table
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className={`tech-panel p-8 text-center ${loaded ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: "0.4s"}}>
            <h2 className="text-xl font-bold mb-2">No Current Season</h2>
            <p className="text-muted-foreground mb-6">Create a season to organize your matches and track player statistics.</p>
            <Button asChild className="cyber-button">
              <Link to="/seasons/create">Create Season</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
