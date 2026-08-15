import { useRouter, useParams } from "next/navigation";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPlayer, getMatches, getSeasons, getSeasonPlayerStats } from "@/lib/db";
import { Match, SeasonPlayerStats } from "@/types";
import { useTeam } from "@/contexts/TeamContext";
import { resultFor } from "@/lib/match-result";

export const usePlayerDetail = () => {
  const { currentTeam } = useTeam();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  // Get player
  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: !!id
  });

  // Get all matches
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches', currentTeam?.id],
    queryFn: getMatches
  });

  // Get all seasons
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons', currentTeam?.id],
    queryFn: getSeasons
  });

  // Get player's stats in all seasons
  const { data: seasonStats = [], isLoading: isLoadingSeasonStats } = useQuery({
    queryKey: ['playerSeasonStats', id],
    queryFn: async () => {
      if (!id) return [];
      
      const allStats: SeasonPlayerStats[] = [];
      
      for (const season of seasons) {
        const seasonPlayerStats = await getSeasonPlayerStats(season.id);
        const playerStats = seasonPlayerStats.find(stat => stat.playerId === id);
        if (playerStats) {
          allStats.push(playerStats);
        }
      }
      
      return allStats;
    },
    enabled: !!id && seasons.length > 0
  });

  // Filter matches by player
  const playerMatches = matches.filter(match => 
    match.teamA.players.includes(id!) || match.teamB.players.includes(id!)
  );

  // Filter player matches by season if a season is selected
  const seasonMatches = selectedSeasonId 
    ? playerMatches.filter(match => match.seasonId === selectedSeasonId)
    : playerMatches;

  // Get selected season
  const selectedSeason = selectedSeasonId 
    ? seasons.find(season => season.id === selectedSeasonId)
    : null;

  // Get stats for selected season
  const selectedSeasonStats = selectedSeasonId
    ? seasonStats.find(stat => stat.seasonId === selectedSeasonId)
    : null;

  /**
   * Which side the player was on, and how it went for them.
   *
   * Read through `resultFor`, like everywhere else. This compared the two
   * scores itself, so a result recorded without one — which is now most of
   * them — came back as "no result" beside a match the table had counted.
   */
  const getPlayerMatchResult = (
    match: Match
  ): { team: "A" | "B"; result: "win" | "loss" | "draw" | null } => ({
    team: match.teamA.players.includes(id!) ? "A" : "B",
    result: id ? resultFor(match, id) : null,
  });

  return {
    player,
    playerMatches: seasonMatches,
    /** Every match the team has played, for anything that replays the history. */
    allMatches: matches,
    seasons,
    seasonStats,
    selectedSeasonId,
    setSelectedSeasonId,
    selectedSeason,
    selectedSeasonStats,
    getPlayerMatchResult,
    isLoading: isLoadingPlayer || isLoadingMatches || isLoadingSeasons || isLoadingSeasonStats,
    router
  };
};
