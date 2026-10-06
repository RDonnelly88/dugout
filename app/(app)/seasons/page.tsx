"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSeasons, getSeasonChampions } from "@/lib/db";
import SeasonCard from "@/components/seasons/SeasonCard";
import SeasonsSummaryTable from "@/components/seasons/SeasonsSummaryTable";
import { useSeasonResults } from "@/hooks/useSeasonResults";
import { getSeasonResultsBatch } from "@/lib/season-results-service";
import { useTeam } from "@/contexts/TeamContext";
import PageHeader from "@/components/PageHeader";

const Seasons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();
  const teamId = currentTeam?.id;
  
  // Get all seasons
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons', currentTeam?.id],
    queryFn: getSeasons,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!currentTeam
  });

  console.log("Fetched seasons:", seasons);

  // Get champions for all seasons
  const { data: champions = [], isLoading: isLoadingChampions } = useQuery({
    queryKey: ['seasonChampions', currentTeam?.id],
    queryFn: () => getSeasonChampions(),
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!currentTeam
  });

  // Force refresh of data when component mounts, team changes, or after creation
  useEffect(() => {
    if (teamId) {
      queryClient.invalidateQueries({ queryKey: ['seasons', teamId] });
      queryClient.invalidateQueries({ queryKey: ['seasonChampions', teamId] });
      queryClient.invalidateQueries({ queryKey: ['seasonStats', teamId] });
    }
  }, [teamId, queryClient]);

  // Prepare recent results for the current season
  const currentSeason = seasons.find(s => s.isCurrent);
  const currentSeasonChampions = currentSeason 
    ? champions.filter(c => c.seasonId === currentSeason.id)
    : [];
  
  const currentSeasonPlayerIds = currentSeasonChampions.map(p => p.playerId);
  
  // Use the season results loader for the current season's top players
  const { seasonResults: currentSeasonForms } = useSeasonResults(
    currentSeason?.id || null,
    currentSeasonPlayerIds
  );
  
  // Champion ids per season, for the batch results load below. Memoised because
  // the effect that reads it depends on it, and a fresh object every render
  // would restart the load every render. React Query hands back the same
  // `seasons` and `champions` references while the data is unchanged, so this
  // only recomputes when one of them actually moves.
  const allChampionPlayerIds = useMemo(() => {
    const byId: Record<string, string[]> = {};
    seasons.forEach(season => {
      byId[season.id] = champions
        .filter(c => c.seasonId === season.id)
        .map(c => c.playerId);
    });
    return byId;
  }, [seasons, champions]);
  
  // Create a map to store recent results for all seasons
  const [allSeasonsResults, setAllSeasonsResults] = useState<Record<string, Record<string, any>>>({});
  
  // Use separate hook calls for each season
  useEffect(() => {
    const loadAllSeasonsResults = async () => {
      const runsMap: Record<string, Record<string, any>> = {};
      
      // Use Promise.all to load recent results for all seasons in parallel
      await Promise.all(
        seasons.map(async (season) => {
          const playerIds = allChampionPlayerIds[season.id] || [];
          
          if (playerIds.length === 0) {
            runsMap[season.id] = {};
            return;
          }
          
          try {
            // Straight to the service. A `queryFn` is a plain callback, so
            // calling the hook here threw on every season and the catch below
            // turned that into an empty map — which is why every season
            // but the current one showed no results at all.
            const data = await queryClient.fetchQuery({
              queryKey: ['seasonResults', season.id, playerIds],
              queryFn: () => getSeasonResultsBatch(season.id, playerIds),
              staleTime: 0
            });

            runsMap[season.id] = data || {};
          } catch (error) {
            console.error(`Error loading results for season ${season.id}:`, error);
            runsMap[season.id] = {};
          }
        })
      );
      
      setAllSeasonsResults(runsMap);
    };
    
    if (seasons.length > 0 && Object.keys(allChampionPlayerIds).length > 0) {
      loadAllSeasonsResults();
    }
  }, [seasons, allChampionPlayerIds, queryClient]);

  // Filter seasons by search term
  const filteredSeasons = seasons.filter(season =>
    season.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Prepare data for the summary table
  const seasonsWithChampions = filteredSeasons.map(season => {
    // Get champions for this season
    const seasonChampions = champions.filter(c => c.seasonId === season.id);
    
    return {
      id: season.id,
      name: season.name,
      isFinished: season.isFinished,
      isCurrent: season.isCurrent,
      champions: seasonChampions
    };
  });

  // Count matches and players for each season
  const { data: seasonStats = {} } = useQuery({
    queryKey: ['seasonStats', currentTeam?.id],
    queryFn: async () => {
      // This is a placeholder - in a real app you would fetch this data from your API
      const stats: Record<string, { matchCount: number; playerCount: number }> = {};
      
      // Populate with dummy data for now
      seasons.forEach(season => {
        stats[season.id] = {
          matchCount: champions.filter(c => c.seasonId === season.id).length > 0 ? 
                     champions.filter(c => c.seasonId === season.id)[0].played || 0 : 0,
          playerCount: champions.filter(c => c.seasonId === season.id).length
        };
      });
      
      return stats;
    },
    enabled: seasons.length > 0 && champions.length > 0,
    staleTime: 0,
    refetchOnMount: "always"
  });

  const isLoading = isLoadingSeasons || isLoadingChampions;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Seasons"
        subtitle={
          <>
            Every season, and who came out on top
          </>
        }
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px] bg-surface border-border"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "cards" | "table")} className="w-auto">
            <TabsList className="grid grid-cols-2 w-[180px]">
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild className="ml-auto">
            <Link href="/seasons/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Season
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sheen h-[200px] rounded-lg" />
          ))}
        </div>
      ) : filteredSeasons.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No seasons match your search" : "No seasons created yet"}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link href="/seasons/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Season
              </Link>
            </Button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeasons.map((season) => {
            const seasonChampions = champions.filter(c => c.seasonId === season.id);
            const stats = seasonStats[season.id] || { matchCount: 0, playerCount: 0 };
            
            // Get recent results for this specific season
            let seasonPlayerResults = {};
            if (season.id === currentSeason?.id) {
              // Use directly loaded current season results
              seasonPlayerResults = currentSeasonForms || {};
            } else {
              // Use recent results from the allSeasonsResults state
              seasonPlayerResults = allSeasonsResults[season.id] || {};
            }
            
            return (
              <SeasonCard
                key={season.id}
                season={season}
                champions={seasonChampions}
                totalPlayers={stats.playerCount}
                totalMatches={stats.matchCount}
                playerResults={seasonPlayerResults}
              />
            );
          })}
        </div>
      ) : (
        <SeasonsSummaryTable seasonsData={seasonsWithChampions} />
      )}
    </div>
  );
};

export default Seasons;
