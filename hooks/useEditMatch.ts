import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateMatch, getMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Player, Match, MatchStatus } from "@/types";
import { useTeam } from "@/contexts/TeamContext";

export const useEditMatch = (matchId: string) => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined);
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>("pending");
  const [notes, setNotes] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useTeam();

  // Fetch the match data
  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId, currentTeam?.id],
    queryFn: () => getMatch(matchId),
    enabled: !!matchId && !!currentTeam
  });

  // Initialize form with match data
  useEffect(() => {
    if (match) {
      setTeamA(match.teamA?.players || []);
      setTeamB(match.teamB?.players || []);
      setDate(match.date ? new Date(match.date) : undefined);
      setSeasonId(match.seasonId);
      setTeamAScore(match.teamA?.score || 0);
      setTeamBScore(match.teamB?.score || 0);
      setStatus(match.status);
      setNotes(match.notes || "");
    }
  }, [match]);

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

  /**
   * Take the two sides as decided and record them.
   *
   * Deliberately does no splitting of its own — see the note in useCreateMatch.
   */
  const randomizeTeams = (nextTeamA: Player[], nextTeamB: Player[]) => {
    if (nextTeamA.length + nextTeamB.length < 2) {
      toast({
        title: "Not enough players",
        description: "You need at least 2 players to create teams.",
        variant: "destructive"
      });
      return;
    }

    setTeamA(nextTeamA.map((player) => player.id));
    setTeamB(nextTeamB.map((player) => player.id));

    toast({
      title: "Teams picked",
      description: `${nextTeamA.length} against ${nextTeamB.length}.`
    });
  };

  const updateMatchMutation = useMutation({
    mutationFn: (matchData: Partial<Match>) => updateMatch(matchId, matchData),
    onSuccess: () => {
      if (currentTeam) {
        queryClient.invalidateQueries({ queryKey: ['matches', currentTeam.id] });
        queryClient.invalidateQueries({ queryKey: ['match', matchId, currentTeam.id] });
      }
      
      router.push(`/matches/${matchId}`);
      toast({
        title: "Match updated",
        description: "The match has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTeam) {
      toast({
        title: "No team selected",
        description: "You must select a team before updating a match.",
        variant: "destructive",
      });
      return;
    }

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
        score: teamAScore
      },
      teamB: {
        name: "Team B",
        players: teamB,
        score: teamBScore
      },
      date: date.toISOString(),
      status: status,
      seasonId: seasonId === "none" ? undefined : seasonId,
      teamId: currentTeam.id,
      notes: notes || undefined
    };

    updateMatchMutation.mutate(matchData);
  };

  return {
    match,
    isLoading,
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
  };
};
