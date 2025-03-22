
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeamSelection from "@/components/matches/TeamSelection";
import TeamRandomizer from "@/components/matches/TeamRandomizer";
import DatePicker from "@/components/matches/DatePicker";
import { useCreateMatch } from "@/hooks/useCreateMatch";

const CreateMatch = () => {
  const { 
    teamA, 
    teamB, 
    date, 
    setDate, 
    togglePlayer, 
    randomizeTeams,
    createMatchMutation, 
    handleSubmit 
  } = useCreateMatch();

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  const availablePlayers = players.filter(player =>
    !teamA.includes(player.id) && !teamB.includes(player.id)
  );

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Create Match</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your next match with customizable team formations
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="team-randomizer-container">
              <TeamRandomizer 
                players={players} 
                onRandomize={randomizeTeams}
                disabled={createMatchMutation.isPending}
              />
            </div>
            
            <div className="team-selection-container">
              <TeamSelection 
                teamA={teamA}
                teamB={teamB}
                players={players}
                togglePlayer={togglePlayer}
                availablePlayers={availablePlayers}
              />
            </div>
            
            <div className="date-picker-container bg-black/10 p-4 rounded-lg">
              <DatePicker date={date} setDate={setDate} />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
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
