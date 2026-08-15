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
  const { canManage, ready } = usePermission();
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
    // Nothing is known until the team has loaded, and "unknown" is not
    // "not allowed".
    if (!ready) return;
    if (!canManage()) {
      toast({
        title: "Team required",
        description: "You need to create or select a team before creating matches",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [ready, canManage, router, toast]);

  // Update query to filter players by team
  const { data: players = [] } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: ready && canManage(),
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
        <h1 className="page-title">Create Match</h1>
        <p className="page-subtitle">
          Pick who is playing, then how to split them
        </p>
      </div>

      <Card className="neo-glassmorphism border-accent/30 shadow-accent/10">
        <CardContent>
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
              <h3 className="section-title mb-4">Match details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePicker date={date} setDate={setDate} label="Match date" />
                </div>
                <div>
                  <SeasonSelect value={seasonId} onChange={setSeasonId} />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" className="w-full" 
              disabled={createMatchMutation.isPending}
            >
              {createMatchMutation.isPending ? "Creating…" : "Create match"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatch;
