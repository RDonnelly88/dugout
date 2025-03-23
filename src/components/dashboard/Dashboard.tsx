
import { useTeam } from "@/contexts/TeamContext";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats, getMatches } from "@/lib/db";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import RecentMatchesList from "./RecentMatchesList";
import TeamManagementCard from "./TeamManagementCard";

const Dashboard = () => {
  const { currentTeam } = useTeam();
  
  // Get current season data
  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
    enabled: !!currentTeam,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always"
  });

  // Get player stats for current season
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id, currentTeam?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason && !!currentTeam,
    staleTime: 0
  });
  
  // Get matches
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
    staleTime: 0,
    refetchOnMount: "always"
  });
  
  console.log(`Dashboard: Team ID: ${currentTeam?.id}, Season: ${currentSeason?.name || 'None'}, Matches: ${matches.length}`);
  
  // Get top 5 players for current season
  const topPlayerIds = seasonPlayerStats
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(player => player.playerId);
    
  // Get form data for top players
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
      <div className="team-header mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Dashboard</h1>
          <TeamSwitcher variant="minimal" />
        </div>
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
        <div className="lg:col-span-2 space-y-6">
          <RecentMatchesList matches={recentMatches} />
        </div>
        
        {/* Team Info */}
        <div className="space-y-6">
          <TeamManagementCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
