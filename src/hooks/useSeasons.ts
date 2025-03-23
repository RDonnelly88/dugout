
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSeasons, getMatches, getSeasonChampions } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";

export const useSeasons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentTeam } = useTeam();

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons', currentTeam?.id],
    queryFn: getSeasons,
    enabled: !!currentTeam
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches', currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam
  });

  const { data: champions = [], isLoading: isLoadingChampions } = useQuery({
    queryKey: ['seasonChampions', currentTeam?.id],
    queryFn: () => getSeasonChampions(),
    enabled: !!currentTeam
  });

  // Get stats for each season
  const seasonStats = seasons.map(season => {
    const seasonMatches = matches.filter(match => match.seasonId === season.id);
    const uniquePlayers = new Set<string>();
    
    // Count unique players in all matches for this season
    seasonMatches.forEach(match => {
      match.teamA.players.forEach(playerId => uniquePlayers.add(playerId));
      match.teamB.players.forEach(playerId => uniquePlayers.add(playerId));
    });
    
    return {
      ...season,
      totalMatches: seasonMatches.length,
      totalPlayers: uniquePlayers.size,
      champions: champions.filter(champion => champion.seasonId === season.id)
    };
  });

  // Filter seasons based on search term
  const filteredSeasons = searchTerm.trim() === "" 
    ? seasonStats 
    : seasonStats.filter(season => 
        season.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return {
    seasons: filteredSeasons,
    isLoading: isLoadingSeasons || isLoadingMatches || isLoadingChampions,
    searchTerm,
    setSearchTerm
  };
};
