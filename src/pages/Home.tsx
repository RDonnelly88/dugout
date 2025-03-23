import { useTeam } from "@/contexts/TeamContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats, getMatches } from "@/lib/db";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import MatchListItem from "@/components/matches/MatchListItem";

// Component to create a team when user has no teams
const CreateFirstTeam = () => {
  const { createTeam } = useTeam();
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const { error } = await createTeam(teamName);
      
      if (error) {
        toast({
          title: "Error creating team",
          description: error.message || "Failed to create team",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating team",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Create Your First Team</CardTitle>
          <CardDescription>
            Create a team to start managing players and matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTeam();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating || !teamName.trim()}>
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Component to show a select team message when user has teams but none selected
const SelectTeam = () => {
  const { userTeams, switchTeam } = useTeam();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Select a Team</CardTitle>
          <CardDescription>
            Choose a team to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userTeams.map(team => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => switchTeam(team.id)}
              >
                {team.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main home component showing dashboard
const Home = () => {
  const { userTeams, currentTeam } = useTeam();
  
  // If user has no teams, show create team UI
  if (userTeams.length === 0) {
    return <CreateFirstTeam />;
  }

  // If user has teams but none selected, show select team UI
  if (!currentTeam) {
    return <SelectTeam />;
  }
  
  return <Dashboard />;
};

// Dashboard component for the home page
const Dashboard = () => {
  const { currentTeam } = useTeam();
  
  // Get current season data
  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
    enabled: !!currentTeam
  });

  // Get player stats for current season
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id, currentTeam?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason && !!currentTeam
  });
  
  // Get matches
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam
  });
  
  // Get top 5 players for current season
  const topPlayerIds = seasonPlayerStats
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(player => player.playerId);
    
  // Get form data for top players
  const { formData: topPlayerForms, isLoading: isLoadingForms } = useBatchFormLoader(
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
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Latest 5 football matches</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMatches.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No matches found</p>
              ) : (
                <div className="space-y-4">
                  {recentMatches.map(match => (
                    <MatchListItem 
                      key={match.id} 
                      match={match} 
                      onDeleteClick={() => {}} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Team Info */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage your current team</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamSwitcher variant="card" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
