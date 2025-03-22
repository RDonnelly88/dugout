
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMatch } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

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

    if (teamA.length !== 5 || teamB.length !== 5) {
      toast({
        title: "Error",
        description: "Each team must have exactly 5 players.",
        variant: "destructive",
      });
      return;
    }

    const matchData = {
      teamA,
      teamB,
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
    createMatchMutation,
    handleSubmit
  };
};
