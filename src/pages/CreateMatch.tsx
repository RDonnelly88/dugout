
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeamSelection from "@/components/matches/TeamSelection";
import TeamRandomizer from "@/components/matches/TeamRandomizer";
import DatePicker from "@/components/matches/DatePicker";
import SeasonSelect from "@/components/matches/SeasonSelect";
import { useCreateMatch } from "@/hooks/useCreateMatch";
import { useState, useEffect } from "react";

const CreateMatch = () => {
  const { 
    teamA, 
    teamB, 
    date, 
    seasonId,
    setDate,
    setSeasonId, 
    togglePlayer, 
    randomizeTeams,
    createMatchMutation, 
    handleSubmit 
  } = useCreateMatch();
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });
  
  // Initialize selected players with all players
  useEffect(() => {
    console.log("CreateMatch: Setting initial selected players from", players.length, "players");
    setSelectedPlayers(players.map(player => player.id));
  }, [players]);

  // Handle player selection from the TeamRandomizer
  const handlePlayerSelectionChange = (playerIds: string[]) => {
    console.log("CreateMatch: Player selection changed to", playerIds.length, "players");
    setSelectedPlayers(playerIds);
  };

  // Debugging log for teams
  useEffect(() => {
    console.log("CreateMatch: Team A updated:", teamA);
    console.log("CreateMatch: Team A players:", players.filter(p => teamA.includes(p.id)).map(p => p.name));
    console.log("CreateMatch: Team B updated:", teamB);
    console.log("CreateMatch: Team B players:", players.filter(p => teamB.includes(p.id)).map(p => p.name));
  }, [teamA, teamB, players]);

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title text-gradient">Create Match</h1>
        <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">
          Set up your next match with customizable team formations
        </p>
      </div>

      <Card className="neo-glassmorphism border-blue-500/30 shadow-blue-500/10">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="team-randomizer-container rounded-xl overflow-hidden shadow-lg border border-blue-500/30">
              <TeamRandomizer 
                players={players} 
                onRandomize={randomizeTeams}
                onSelectionChange={handlePlayerSelectionChange}
                disabled={createMatchMutation.isPending}
              />
            </div>
            
            <div className="match-teams-container">
              <TeamSelection 
                teamA={teamA}
                teamB={teamB}
                players={players}
                selectedPlayers={selectedPlayers}
                togglePlayer={togglePlayer}
              />
            </div>
            
            <div className="date-picker-container glass-card p-6 rounded-xl border border-blue-500/20 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Match Date</label>
                  <DatePicker date={date} setDate={setDate} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Season</label>
                  <SeasonSelect value={seasonId} onChange={setSeasonId} />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300" 
              disabled={createMatchMutation.isPending}
            >
              {createMatchMutation.isPending ? "Creating..." : "Create Match"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatch;
