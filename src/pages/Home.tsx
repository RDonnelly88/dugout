
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayers, getMatches, getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { Player, Match, Season, SeasonPlayerStats } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlayerCard from "@/components/players/PlayerCard";
import MatchListItem from "@/components/matches/MatchListItem";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const { currentTeam, userTeams } = useTeam();
  
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["players", currentTeam?.id],
    queryFn: () => getPlayers(),
    enabled: !!currentTeam
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["matches", currentTeam?.id],
    queryFn: () => getMatches(),
    enabled: !!currentTeam
  });

  const { data: currentSeason } = useQuery<Season | undefined>({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: () => getCurrentSeason(),
    enabled: !!currentTeam
  });

  const { data: seasonPlayerStats = [] } = useQuery<SeasonPlayerStats[]>({
    queryKey: ["seasonPlayerStats", currentSeason?.id, currentTeam?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason && !!currentTeam
  });

  // If user has no teams, show create team UI
  if (userTeams.length === 0) {
    return <CreateFirstTeam />;
  }

  // If user has teams but none selected, show select team UI
  if (!currentTeam) {
    return <SelectTeam />;
  }

  // Filter recent matches to show only 5 most recent
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="page-container">
      <div className="team-header">
        <h1 className="text-2xl font-bold">Dashboard: {currentTeam.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Season Info */}
        <div className="lg:col-span-3">
          <CurrentSeasonCard 
            currentSeason={currentSeason} 
            seasonPlayerStats={seasonPlayerStats} 
          />
        </div>
        
        {/* Top Players */}
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
                    <MatchListItem key={match.id} match={match} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Players */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
              <CardDescription>Players with the best stats</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No players found</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {players
                    .sort((a, b) => 
                      (b.stats.won - b.stats.lost) - (a.stats.won - a.stats.lost)
                    )
                    .slice(0, 3)
                    .map(player => (
                      <div key={player.id} className="transition-all hover:translate-y-[-2px]">
                        <PlayerCard player={player} />
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
