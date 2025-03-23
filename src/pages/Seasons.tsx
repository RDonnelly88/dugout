import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSeasons, getSeasonChampions } from "@/lib/db";
import SeasonCard from "@/components/seasons/SeasonCard";
import SeasonsSummaryTable from "@/components/seasons/SeasonsSummaryTable";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import { useTeam } from "@/contexts/TeamContext";

const Seasons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();
  
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
    if (currentTeam) {
      console.log("Seasons page: Refreshing data for team:", currentTeam.id);
      
      // Force refetch of all relevant queries
      queryClient.invalidateQueries({ queryKey: ['seasons', currentTeam.id] });
      queryClient.invalidateQueries({ queryKey: ['seasonChampions', currentTeam.id] });
      queryClient.invalidateQueries({ queryKey: ['seasonStats', currentTeam.id] });
    }
  }, [currentTeam?.id, queryClient]);

  // Prepare data for player forms for the current season
  const currentSeason = seasons.find(s => s.isCurrent);
  const currentSeasonChampions = currentSeason 
    ? champions.filter(c => c.seasonId === currentSeason.id)
    : [];
  
  const currentSeasonPlayerIds = currentSeasonChampions.map(p => p.playerId);
  
  // Use the batch form loader for the current season's top players
  const { formData: currentSeasonForms, isLoading: isLoadingCurrentSeasonForms } = useBatchFormLoader(
    currentSeason?.id || null,
    currentSeasonPlayerIds
  );
  
  // Collect player IDs for all seasons' champions to batch load form data
  const allChampionPlayerIds: Record<string, string[]> = {};
  
  seasons.forEach(season => {
    const seasonChampions = champions.filter(c => c.seasonId === season.id);
    allChampionPlayerIds[season.id] = seasonChampions.map(c => c.playerId);
  });
  
  // Create a map to store form data for all seasons
  const [allSeasonsForms, setAllSeasonsForms] = useState<Record<string, Record<string, any>>>({});
  
  // Use separate hook calls for each season
  useEffect(() => {
    const loadAllSeasonsForms = async () => {
      const formsMap: Record<string, Record<string, any>> = {};
      
      // Use Promise.all to load form data for all seasons in parallel
      await Promise.all(
        seasons.map(async (season) => {
          const playerIds = allChampionPlayerIds[season.id] || [];
          
          if (playerIds.length === 0) {
            formsMap[season.id] = {};
            return;
          }
          
          try {
            // Use the queryClient directly to fetch data
            const data = await queryClient.fetchQuery({
              queryKey: ['batchPlayerForms', season.id, playerIds],
              queryFn: async () => {
                // This will use the existing hook logic
                const { formData } = useBatchFormLoader(season.id, playerIds);
                return formData || {};
              },
              staleTime: 0
            });
            
            formsMap[season.id] = data || {};
          } catch (error) {
            console.error(`Error loading forms for season ${season.id}:`, error);
            formsMap[season.id] = {};
          }
        })
      );
      
      setAllSeasonsForms(formsMap);
    };
    
    if (seasons.length > 0 && Object.keys(allChampionPlayerIds).length > 0) {
      loadAllSeasonsForms();
    }
  }, [seasons.length, Object.keys(allChampionPlayerIds).length]);

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
      <div className="page-header">
        <h1 className="page-title">Seasons</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage your football seasons
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px] bg-gray-900 border-gray-800"
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
            <Link to="/seasons/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Season
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer h-[200px] rounded-lg" />
          ))}
        </div>
      ) : filteredSeasons.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No seasons match your search" : "No seasons created yet"}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link to="/seasons/create">
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
            
            // Get form data for this specific season
            let seasonPlayerForms = {};
            if (season.id === currentSeason?.id) {
              // Use directly loaded current season forms
              seasonPlayerForms = currentSeasonForms || {};
            } else {
              // Use form data from the allSeasonsForms state
              seasonPlayerForms = allSeasonsForms[season.id] || {};
            }
            
            return (
              <SeasonCard
                key={season.id}
                season={season}
                champions={seasonChampions}
                totalPlayers={stats.playerCount}
                totalMatches={stats.matchCount}
                playerForms={seasonPlayerForms}
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
