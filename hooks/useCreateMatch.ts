import { useRouter } from "next/navigation";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMatch } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Match, Player } from "@/types";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";

/**
 * What a fixture is before anybody has played it: two sides and a date.
 *
 * Typed rather than `any`, which is what let a status outside the union and a
 * score nobody had recorded through unnoticed.
 */
type NewMatch = Omit<Match, "id" | "createdAt" | "updatedAt">;

export const useCreateMatch = () => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useTeam();
  const sides = useSideNames();

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
   * Deliberately does no splitting of its own. It used to be handed a flat
   * list and reshuffle it, which quietly discarded whichever balance the
   * randomiser had just worked out and dealt out on screen.
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

  const createMatchMutation = useMutation({
    mutationFn: (matchData: NewMatch) => addMatch(matchData),
    onSuccess: (data) => {
      // Invalidate all team-specific queries to ensure data is refreshed
      if (currentTeam) {
        queryClient.invalidateQueries({ queryKey: ['matches', currentTeam.id] });
      }
      
      const typedData = data as any;
      router.push(`/matches/${typedData.id}`);
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

    if (!currentTeam) {
      toast({
        title: "No team selected",
        description: "You must select a team before creating a match.",
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

    console.log(`Creating match for team: ${currentTeam.id}`);
    
    // No score. Nobody has played, and nought is a scoreline: a fixture
    // created nil-nil arrives at the recording screen with a complete score
    // already on it, and a complete score overrules the result being clicked.
    const matchData: NewMatch = {
      teamA: {
        name: sides.A,
        players: teamA
      },
      teamB: {
        name: sides.B,
        players: teamB
      },
      date: date.toISOString(),
      status: "scheduled",
      outcome: null,
      seasonId: seasonId === "none" ? undefined : seasonId,
      teamId: currentTeam.id
    };

    createMatchMutation.mutate(matchData);
  };

  return {
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
  };
};
