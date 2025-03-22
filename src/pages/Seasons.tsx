
import React from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeasons } from "@/hooks/useSeasons";
import SeasonCard from "@/components/seasons/SeasonCard";

const Seasons = () => {
  const { seasons, isLoading, searchTerm, setSearchTerm } = useSeasons();

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
            className="pl-9 w-full sm:w-[300px]"
          />
        </div>
        <Button asChild>
          <Link to="/seasons/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Season
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer h-[200px] rounded-lg" />
          ))}
        </div>
      ) : seasons.length === 0 ? (
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              champions={season.champions}
              totalPlayers={season.totalPlayers}
              totalMatches={season.totalMatches}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Seasons;
