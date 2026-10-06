"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatches, getSeasons, getSeasonChampions } from "@/lib/db";
import { outcomeOf } from "@/lib/match-result";
import SeasonCard from "@/components/seasons/SeasonCard";
import SeasonsSummaryTable from "@/components/seasons/SeasonsSummaryTable";
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
    }
  }, [teamId, queryClient]);

  // Counted from the matches, like everything else: how many were played in
  // each season, and how many different people played in them.
  const { data: matches = [] } = useQuery({
    queryKey: ['matches', currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const seasonCounts = useMemo(() => {
    const counts = new Map<string, { matchCount: number; players: Set<string> }>();
    for (const match of matches) {
      if (!match.seasonId || outcomeOf(match) === null) continue;
      const entry = counts.get(match.seasonId) ?? { matchCount: 0, players: new Set<string>() };
      entry.matchCount += 1;
      for (const id of [...match.teamA.players, ...match.teamB.players]) entry.players.add(id);
      counts.set(match.seasonId, entry);
    }
    return counts;
  }, [matches]);

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
            const counts = seasonCounts.get(season.id);

            return (
              <SeasonCard
                key={season.id}
                season={season}
                champions={seasonChampions}
                totalPlayers={counts?.players.size ?? 0}
                totalMatches={counts?.matchCount ?? 0}
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
