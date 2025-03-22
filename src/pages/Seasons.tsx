
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getSeasons, getSeasonChampions, getPlayerFormInSeason } from "@/lib/db";
import SeasonCard from "@/components/seasons/SeasonCard";
import SeasonsSummaryTable from "@/components/seasons/SeasonsSummaryTable";
import { PlayerFormResult } from "@/types";

const Seasons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  // Get all seasons
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons
  });

  // Get champions for all seasons
  const { data: champions = [], isLoading: isLoadingChampions } = useQuery({
    queryKey: ['seasonChampions'],
    queryFn: () => getSeasonChampions()
  });

  // Prepare data for the player forms
  const [playerForms, setPlayerForms] = useState<Record<string, Record<string, PlayerFormResult[]>>>({});

  // Load player forms for all seasons
  useQuery({
    queryKey: ['allPlayerForms'],
    queryFn: async () => {
      const allForms: Record<string, Record<string, PlayerFormResult[]>> = {};
      
      for (const season of seasons) {
        const seasonChampions = champions.filter(c => c.seasonId === season.id);
        const seasonForms: Record<string, PlayerFormResult[]> = {};
        
        for (const player of seasonChampions) {
          try {
            const form = await getPlayerFormInSeason(season.id, player.playerId);
            seasonForms[player.playerId] = form;
          } catch (error) {
            console.error(`Error fetching form for player ${player.playerId} in season ${season.id}:`, error);
            seasonForms[player.playerId] = [];
          }
        }
        
        allForms[season.id] = seasonForms;
      }
      
      setPlayerForms(allForms);
      return allForms;
    },
    enabled: seasons.length > 0 && champions.length > 0
  });

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
    queryKey: ['seasonStats'],
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
    enabled: seasons.length > 0 && champions.length > 0
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
            const seasonPlayerForms = playerForms[season.id] || {};
            
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
