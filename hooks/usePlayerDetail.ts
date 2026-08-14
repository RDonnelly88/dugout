import { useRouter, useParams } from "next/navigation";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPlayer, getMatches, getSeasons, getSeasonPlayerStats } from "@/lib/db";
import { Match, Season, SeasonPlayerStats } from "@/types";

export const usePlayerDetail = () => {
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
    queryKey: ['matches'],
    queryFn: getMatches
  });

  // Get all seasons
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons'],
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

  // Function to determine player's team and result
  const getPlayerMatchResult = (match: Match): { team: 'A' | 'B', result: 'win' | 'loss' | 'draw' | null } => {
    if (match.status !== 'completed' || match.teamA.score === undefined || match.teamB.score === undefined) {
      return { team: match.teamA.players.includes(id!) ? 'A' : 'B', result: null };
    }

    const isTeamA = match.teamA.players.includes(id!);
    const team = isTeamA ? 'A' : 'B';
    let result: 'win' | 'loss' | 'draw' | null = null;

    if (match.teamA.score > match.teamB.score) {
      result = isTeamA ? 'win' : 'loss';
    } else if (match.teamA.score < match.teamB.score) {
      result = isTeamA ? 'loss' : 'win';
    } else {
      result = 'draw';
    }

    return { team, result };
  };

  return {
    player,
    playerMatches: seasonMatches,
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
