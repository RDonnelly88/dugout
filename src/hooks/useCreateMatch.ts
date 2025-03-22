
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMatch } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/types";

export const useCreateMatch = () => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const togglePlayer = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      if (teamA.includes(playerId)) {
        setTeamA(teamA.filter(id => id !== playerId));
      } else {
        setTeamA([...teamA, playerId]);
      }
      setTeamB(teamB.filter(id => id !== playerId));
    } else {
      if (teamB.includes(playerId)) {
        setTeamB(teamB.filter(id => id !== playerId));
      } else {
        setTeamB([...teamB, playerId]);
      }
      setTeamA(teamA.filter(id => id !== playerId));
    }
  };

  const randomizeTeams = (players: Player[], teamSize: number = 5) => {
    // Reset current teams
    setTeamA([]);
    setTeamB([]);
    
    // If no players were randomized, don't proceed
    if (players.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select players to randomize teams.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a copy of player IDs and shuffle them
    const playerIds = players.map(player => player.id);
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }
    
    // Split into teams based on selected team size
    // If there are not enough players for even teams, distribute them as evenly as possible
    const totalPlayers = playerIds.length;
    const playersPerTeam = Math.min(teamSize, Math.floor(totalPlayers / 2));
    
    // Ensure we have at least one player per team
    if (playersPerTeam < 1) {
      toast({
        title: "Not enough players",
        description: "You need at least 2 players to create teams.",
        variant: "destructive"
      });
      return;
    }
    
    setTeamA(playerIds.slice(0, playersPerTeam));
    setTeamB(playerIds.slice(playersPerTeam, playersPerTeam * 2));
    
    toast({
      title: "Teams randomized",
      description: `Players have been randomly assigned to ${playersPerTeam}-a-side teams.`
    });
  };

  const createMatchMutation = useMutation({
    mutationFn: (matchData: any) => addMatch(matchData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      const typedData = data as any;
      navigate(`/matches/${typedData.id}`);
      toast({
        title: "Match created",
        description: "The match has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the match.",
        variant: "destructive",
      });
      return;
    }

    if (teamA.length === 0 || teamB.length === 0) {
      toast({
        title: "Error",
        description: "Each team must have at least one player.",
        variant: "destructive",
      });
      return;
    }

    const matchData = {
      teamA: {
        name: "Team A",
        players: teamA,
        score: 0
      },
      teamB: {
        name: "Team B",
        players: teamB,
        score: 0
      },
      date: date.toISOString(),
      status: "scheduled"
    };

    createMatchMutation.mutate(matchData);
  };

  return {
    teamA,
    teamB,
    date,
    setDate,
    togglePlayer,
    randomizeTeams,
    createMatchMutation,
    handleSubmit
  };
};
