import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import TeamSelection from "@/components/matches/TeamSelection";
import TeamRandomizer from "@/components/matches/TeamRandomizer";
import DatePicker from "@/components/matches/DatePicker";
import SeasonSelect from "@/components/matches/SeasonSelect";
import { useEditMatch } from "@/hooks/useEditMatch";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";

const EditMatch = () => {
  const { id } = useParams<{ id: string }>();
  const { canManage } = usePermission();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeam } = useTeam();
  
  const { 
    match,
    isLoading: isLoadingMatch,
    teamA, 
    teamB, 
    date, 
    seasonId,
    setDate,
    setSeasonId, 
    togglePlayer, 
    randomizeTeams,
    updateMatchMutation, 
    handleSubmit 
  } = useEditMatch(id!);
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (!canManage()) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to edit matches",
        variant: "destructive",
      });
      navigate("/matches");
    }
  }, [canManage, navigate, toast]);

  const { data: players = [] } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: canManage(),
    select: (data) => {
      if (currentTeam) {
        return data.filter(player => player.teamId === currentTeam.id);
      }
      return data;
    }
  });
  
  // Initialize selected players
  useEffect(() => {
    if (match) {
      const allMatchPlayers = [...(match.teamA?.players || []), ...(match.teamB?.players || [])];
      setSelectedPlayers(allMatchPlayers);
    }
  }, [match]);

  const handlePlayerSelectionChange = (playerIds: string[]) => {
    setSelectedPlayers(playerIds);
  };

  if (isLoadingMatch) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[600px]"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Match not found</h2>
          <p className="text-muted-foreground mt-2">The match you're trying to edit doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="page-header">
        <h1 className="page-title text-gradient">Edit Match</h1>
        <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">
          Update match details and team compositions
        </p>
      </div>

      <Card className="neo-glassmorphism border-accent/30 shadow-accent/10">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-card/50 rounded-xl overflow-hidden shadow-lg border border-accent/30 p-4">
              <TeamRandomizer 
                players={players} 
                onRandomize={randomizeTeams}
                onSelectionChange={handlePlayerSelectionChange}
                disabled={updateMatchMutation.isPending}
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

            <div className="flex gap-4">
              <DatePicker date={date} setDate={setDate} />
              <SeasonSelect 
                value={seasonId} 
                onChange={setSeasonId}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-gradient"
              disabled={updateMatchMutation.isPending}
            >
              {updateMatchMutation.isPending ? "Updating..." : "Update Match"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMatch;
