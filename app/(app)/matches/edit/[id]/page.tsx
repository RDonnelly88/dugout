"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  const { canManage, ready } = usePermission();
  const router = useRouter();
  const { toast } = useToast();
  const { currentTeam } = useTeam();
  
  const { 
    match,
    isLoading: isLoadingMatch,
    teamA, 
    teamB, 
    date, 
    seasonId,
    teamAScore,
    teamBScore,
    status,
    notes,
    setDate,
    setSeasonId,
    setTeamAScore,
    setTeamBScore,
    setStatus,
    setNotes,
    togglePlayer, 
    randomizeTeams,
    updateMatchMutation, 
    handleSubmit 
  } = useEditMatch(id!);
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    // Nothing is known until the team has loaded, and "unknown" is not
    // "not allowed".
    if (!ready) return;
    if (!canManage()) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to edit matches",
        variant: "destructive",
      });
      router.push("/matches");
    }
  }, [ready, canManage, router, toast]);

  const { data: players = [] } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: ready && canManage(),
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
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
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="page-header">
        <h1 className="page-title">Edit Match</h1>
        <p className="page-subtitle mx-auto text-center">
          Update match details and team compositions
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

            <div className="space-y-6 bg-card/50 rounded-xl p-6 border border-accent/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="match-completed" className="text-base font-semibold">
                  Match Completed
                </Label>
                <Switch
                  id="match-completed"
                  checked={status === "completed"}
                  onCheckedChange={(checked) => setStatus(checked ? "completed" : "pending")}
                />
              </div>

              {status === "completed" && (
                <div className="space-y-4 pt-4 border-t border-accent/20">
                  <h3 className="text-lg font-semibold">Match Result</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team-a-score">Team A Score</Label>
                      <Input
                        id="team-a-score"
                        type="number"
                        min="0"
                        value={teamAScore}
                        onChange={(e) => setTeamAScore(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team-b-score">Team B Score</Label>
                      <Input
                        id="team-b-score"
                        type="number"
                        min="0"
                        value={teamBScore}
                        onChange={(e) => setTeamBScore(parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <DatePicker date={date} setDate={setDate} />
              <SeasonSelect 
                value={seasonId} 
                onChange={setSeasonId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="match-notes">Match Notes</Label>
              <Textarea
                id="match-notes"
                placeholder="Add any notes about this match..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
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
