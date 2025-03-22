
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
          Set up your next match with customizable team sizes
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TeamRandomizer 
              players={players} 
              onRandomize={randomizeTeams}
              disabled={createMatchMutation.isPending}
            />
            
            <TeamSelection 
              teamA={teamA}
              teamB={teamB}
              players={players}
              togglePlayer={togglePlayer}
              availablePlayers={availablePlayers}
            />
            
            <DatePicker date={date} setDate={setDate} />

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
