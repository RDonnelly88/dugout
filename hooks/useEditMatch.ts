import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateMatch, getMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Player, Match, MatchStatus } from "@/types";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf, resolveOutcome, type Outcome } from "@/lib/match-result";

export const useEditMatch = (matchId: string) => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined);
  // Undefined rather than nought: a match can be played without anybody having
  // written the score down, and nought is a scoreline.
  const [teamAScore, setTeamAScore] = useState<number | undefined>(undefined);
  const [teamBScore, setTeamBScore] = useState<number | undefined>(undefined);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [status, setStatus] = useState<MatchStatus>("scheduled");
  const [notes, setNotes] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useTeam();
  const sides = useSideNames();

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
      // Only off a match that has been played: a fixture carrying a nil-nil
      // from before creation stopped inventing one would otherwise arrive with
      // a complete score, which decides the result on its own.
      const played = match.status === "completed";
      setTeamAScore(played ? match.teamA?.score : undefined);
      setTeamBScore(played ? match.teamB?.score : undefined);
      setOutcome(outcomeOf(match));
      setStatus(match.status);
      setNotes(match.notes || "");
    }
  }, [match]);

  const effectiveOutcome = resolveOutcome(teamAScore, teamBScore, outcome);

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

    if (status === "completed" && !effectiveOutcome) {
      toast({
        title: "Nothing to record",
        description: "Say who won, or enter the score.",
        variant: "destructive",
      });
      return;
    }

    // Half a score is no score: saving one side would leave a match reading
    // "4 – " for ever.
    const bothScores = teamAScore !== undefined && teamBScore !== undefined;

    const matchData = {
      teamA: {
        name: sides.A,
        players: teamA,
        score: bothScores ? teamAScore : undefined
      },
      teamB: {
        name: sides.B,
        players: teamB,
        score: bothScores ? teamBScore : undefined
      },
      date: date.toISOString(),
      status: status,
      outcome: status === "completed" ? effectiveOutcome : null,
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
    setOutcome,
    effectiveOutcome,
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
