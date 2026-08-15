
import { useTeam } from "@/contexts/TeamContext";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats, getMatches } from "@/lib/db";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import RecentMatchesList from "./RecentMatchesList";

const Dashboard = () => {
  const { currentTeam } = useTeam();
  
  // Get current season data with improved team filtering
  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: () => currentTeam ? getCurrentSeason() : Promise.resolve(undefined),
    enabled: !!currentTeam,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always"
  });

  // Get player stats for current season with strict team checking
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id, currentTeam?.id],
    queryFn: () => currentSeason && currentTeam 
      ? getSeasonPlayerStats(currentSeason.id) 
      : Promise.resolve([]),
    enabled: !!currentSeason && !!currentTeam,
    staleTime: 0
  });
  
  // Get matches with improved team filtering
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: () => currentTeam ? getMatches() : Promise.resolve([]),
    enabled: !!currentTeam,
    staleTime: 0,
    refetchOnMount: "always"
  });
  
  // Get top 5 players for current season
  const topPlayerIds = seasonPlayerStats
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(player => player.playerId);
    
  // Get form data for top players with strict team checking
  const { formData: topPlayerForms } = useBatchFormLoader(
    currentSeason?.id || null,
    topPlayerIds
  );

  // Filter recent matches
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="page-container">
      <div className="page-header">
        {/* The team is already named in the bar above on a phone and in the
            sidebar on a desktop; a third copy here is just noise. */}
        <h1 className="page-title">Dashboard</h1>
        {currentSeason && (
          <p className="mt-2 text-muted-foreground">{currentSeason.name}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Season Summary and Top 5 Players */}
        <div className="lg:col-span-3">
          {currentSeason && seasonPlayerStats.length > 0 ? (
            <SeasonLeaderboard 
              stats={seasonPlayerStats} 
              seasonId={currentSeason.id}
              playerForms={topPlayerForms}
              limit={5}
              seasonName={currentSeason.name}
            />
          ) : (
            <CurrentSeasonCard 
              currentSeason={currentSeason} 
              seasonPlayerStats={seasonPlayerStats} 
            />
          )}
        </div>
        
        {/* Recent Matches */}
        <div className="lg:col-span-3 space-y-6">
          <RecentMatchesList matches={recentMatches} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
