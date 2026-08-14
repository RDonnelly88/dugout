import { useRouter, useParams } from "next/navigation";

import { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatch, getPlayers, updateMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types";
import { useTeam } from "@/contexts/TeamContext";

export const useMatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();

  const [isEditing, setIsEditing] = useState(false);
  const [teamAScore, setTeamAScore] = useState<number | undefined>(undefined);
  const [teamBScore, setTeamBScore] = useState<number | undefined>(undefined);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ['match', id, currentTeam?.id],
    queryFn: () => getMatch(id!),
    enabled: !!id && !!currentTeam
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam
  });

  // Update match mutation
  const updateMatchMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Match> }) => 
      updateMatch(data.id, data.updates),
    onSuccess: () => {
      // Invalidate all team-specific queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ['matches', currentTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['match', id, currentTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['players', currentTeam?.id] });
      
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

  // If match doesn't belong to current team, redirect to matches page
  useEffect(() => {
    if (match && currentTeam && match.teamId !== currentTeam.id) {
      toast({
        title: "Access denied",
        description: "You don't have access to this match.",
        variant: "destructive",
      });
      router.push("/matches");
    }
  }, [match, currentTeam, router, toast]);

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
    if (!currentTeam) {
      toast({
        title: "No team selected",
        description: "You must select a team to update a match.",
        variant: "destructive",
      });
      return;
    }

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
    router
  };
};
