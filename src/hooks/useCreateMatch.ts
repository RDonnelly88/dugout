
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
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
    
    // If no players were selected, don't proceed
    if (players.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select players to randomize teams.",
        variant: "destructive"
      });
      return [];
    }
    
    // Need at least 2 players to form teams
    if (players.length < 2) {
      toast({
        title: "Not enough players",
        description: "You need at least 2 players to create teams.",
        variant: "destructive"
      });
      return [];
    }
    
    // Extract the player IDs and shuffle them randomly
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Split the players into teams
    const halfIndex = Math.ceil(shuffledPlayers.length / 2);
    const teamAPlayers = shuffledPlayers.slice(0, halfIndex);
    const teamBPlayers = shuffledPlayers.slice(halfIndex);
    
    // Get the player IDs for each team
    const teamAIds = teamAPlayers.map(player => player.id);
    const teamBIds = teamBPlayers.map(player => player.id);
    
    // Update the state with the new teams
    setTeamA(teamAIds);
    setTeamB(teamBIds);
    
    toast({
      title: "Teams created",
      description: `Team A: ${teamAPlayers.length} players, Team B: ${teamBPlayers.length} players`
    });
    
    return players;
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
