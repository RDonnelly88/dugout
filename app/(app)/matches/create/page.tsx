"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeamSelection from "@/components/matches/TeamSelection";
import TeamRandomizer from "@/components/matches/TeamRandomizer";
import DatePicker from "@/components/matches/DatePicker";
import SeasonSelect from "@/components/matches/SeasonSelect";
import { useCreateMatch } from "@/hooks/useCreateMatch";
import { useState } from "react";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";

const CreateMatch = () => {
  const { canManage } = usePermission();
  const router = useRouter();
  const { toast } = useToast();
  const { currentTeam } = useTeam();
  
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

  useEffect(() => {
    if (!canManage()) {
      toast({
        title: "Team required",
        description: "You need to create or select a team before creating matches",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [canManage, router, toast]);

  // Update query to filter players by team
  const { data: players = [] } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: canManage(),
    select: (data) => {
      // Filter players by current team ID
      if (currentTeam) {
        console.log("Filtering players for team:", currentTeam.id);
        return data.filter(player => player.teamId === currentTeam.id);
      }
      return data;
    }
  });
  
  // Initialize selected players with all team players
  useEffect(() => {
    console.log("CreateMatch: Setting initial selected players from", players.length, "players");
    setSelectedPlayers(players.map(player => player.id));
  }, [players]);

  // Handle player selection from the TeamRandomizer
  const handlePlayerSelectionChange = (playerIds: string[]) => {
    console.log("CreateMatch: Player selection changed to", playerIds.length, "players");
    setSelectedPlayers(playerIds);
  };

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title text-gradient">Create Match</h1>
        <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">
          Set up your next match with customizable team formations
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
            
            <div className="glass-card p-6 rounded-xl border border-accent/20 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePicker date={date} setDate={setDate} label="Match Date" />
                </div>
                <div>
                  <SeasonSelect value={seasonId} onChange={setSeasonId} />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium shadow-lg bg-gradient-to-r from-accent/80 to-accent/90 hover:from-accent/90 hover:to-accent transition-all duration-300" 
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
