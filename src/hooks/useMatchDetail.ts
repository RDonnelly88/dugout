
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatch, getPlayers, updateMatch } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/types";

export const useMatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [teamAScore, setTeamAScore] = useState<number | undefined>(undefined);
  const [teamBScore, setTeamBScore] = useState<number | undefined>(undefined);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id!),
    enabled: !!id
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  // Update match mutation
  const updateMatchMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Match> }) => 
      updateMatch(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      
      toast({
        title: "Match updated",
        description: "The match result has been recorded successfully.",
      });
      
      setIsEditing(false);
      setShowConfetti(true);
      
      // Hide confetti after a few seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveResult = () => {
    if (teamAScore === undefined || teamBScore === undefined) {
      toast({
        title: "Validation Error",
        description: "Please enter scores for both teams.",
        variant: "destructive",
      });
      return;
    }

    if (teamAScore < 0 || teamBScore < 0) {
      toast({
        title: "Validation Error",
        description: "Scores cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (!match || !match.teamA || !match.teamB) return;

    const updates = {
      teamA: {
        ...match.teamA,
        score: teamAScore
      },
      teamB: {
        ...match.teamB,
        score: teamBScore
      },
      status: "completed" as const
    };

    updateMatchMutation.mutate({ id: match.id, updates });
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  // Initialize form values when match data is loaded
  useEffect(() => {
    if (match) {
      if (match.teamA?.score !== undefined) {
        setTeamAScore(match.teamA.score);
      }
      if (match.teamB?.score !== undefined) {
        setTeamBScore(match.teamB.score);
      }
    }
  }, [match]);

  return {
    id,
    match,
    players,
    isLoadingMatch,
    isEditing,
    setIsEditing,
    teamAScore,
    setTeamAScore,
    teamBScore,
    setTeamBScore,
    showConfetti,
    updateMatchMutation,
    handleSaveResult,
    getPlayerName,
    navigate
  };
};
