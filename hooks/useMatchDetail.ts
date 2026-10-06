import { useRouter, useParams } from "next/navigation";

import { useState, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatch, getPlayers, updateMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types";
import { useTeam } from "@/contexts/TeamContext";
import { outcomeOf, resolveOutcome, type Outcome } from "@/lib/match-result";

export const useMatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();

  const [isEditing, setIsEditing] = useState(false);
  // Who won is the result; the score is optional detail on top of it.
  const [outcome, setOutcome] = useState<Outcome | null>(null);
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

  const effectiveOutcome = resolveOutcome(teamAScore, teamBScore, outcome);

  const handleSaveResult = () => {
    if (!effectiveOutcome) {
      toast({
        title: "Nothing to save",
        description: "Say who won, or enter the score.",
        variant: "destructive",
      });
      return;
    }

    if ((teamAScore ?? 0) < 0 || (teamBScore ?? 0) < 0) {
      toast({
        title: "That score cannot be right",
        description: "Neither side can score fewer than none.",
        variant: "destructive",
      });
      return;
    }

    // Half a score is no score. Saving one side would leave a match reading
    // "4 – " for ever.
    const bothScores = teamAScore !== undefined && teamBScore !== undefined;

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
        score: bothScores ? teamAScore : undefined
      },
      teamB: {
        ...match.teamB,
        score: bothScores ? teamBScore : undefined
      },
      outcome: effectiveOutcome,
      status: "completed" as const
    };

    updateMatchMutation.mutate({ id: match.id, updates });
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  // Fill the form from the match, but only take a score off one that has
  // actually been played. Fixtures written before the creation screen stopped
  // inventing them carry a nil-nil, and reading it back put a complete score
  // on a game nobody had turned up to — which then decided the result and left
  // the buttons apparently dead.
  useEffect(() => {
    if (!match) return;
    const played = match.status === "completed";
    setTeamAScore(played ? match.teamA?.score : undefined);
    setTeamBScore(played ? match.teamB?.score : undefined);
    setOutcome(outcomeOf(match));
  }, [match]);

  return {
    id,
    match,
    players,
    isLoadingMatch,
    isEditing,
    setIsEditing,
    outcome,
    setOutcome,
    effectiveOutcome,
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
