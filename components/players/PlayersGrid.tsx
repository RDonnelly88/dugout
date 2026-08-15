import Link from "next/link";

import React from "react";

import { Player, PlayerFormResult, SeasonPlayerStats } from "@/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerCard from "./PlayerCard";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { scopeTo, type ActiveScope } from "./ActiveFilter";

interface PlayersGridProps {
  players: Player[];
  currentSeasonId: string | null;
  seasonPlayerStats: SeasonPlayerStats[];
  batchFormData: Record<string, PlayerFormResult[]>;
  isLoadingForms: boolean;
  onDeleteClick: (player: Player) => void;
  searchTerm: string;
  scope: ActiveScope;
}

const PlayersGrid: React.FC<PlayersGridProps> = ({
  players,
  currentSeasonId,
  seasonPlayerStats,
  batchFormData,
  isLoadingForms,
  onDeleteClick,
  searchTerm,
  scope,
}) => {
  // One query for the whole grid. Asking per card would open a dozen requests
  // for the same answer and let them arrive at different moments.
  const { recordFor } = usePlayerRecords();

  const filteredPlayers = scopeTo(players, scope).filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading skeleton
  if (players.length > 0 && filteredPlayers.length === 0 && searchTerm === "") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="shimmer h-[200px] bg-surface border-border rounded-lg" />
        ))}
      </div>
    );
  }

  // No players found
  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg">
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? "No players match your search"
            : scope === "active"
              ? "No active players — try Everyone"
              : "No players added yet"}
        </p>
        {!searchTerm && players.length === 0 && (
          <Button asChild>
            <Link href="/players/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Function to get player's season stats and form data
  const getPlayerSeasonData = (playerId: string): { seasonStats: SeasonPlayerStats | undefined, formResults: PlayerFormResult[] } => {
    const playerStats = seasonPlayerStats.find(stat => stat.playerId === playerId);
    const formResults = batchFormData[playerId] || [];
    
    return { 
      seasonStats: playerStats,
      formResults
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPlayers.map((player) => {
        const { seasonStats, formResults } = getPlayerSeasonData(player.id);
        
        return (
          <PlayerCard
            key={player.id}
            player={player}
            seasonId={currentSeasonId}
            seasonStats={seasonStats}
            record={recordFor(player.id, player.name)}
            formResults={formResults}
            isLoadingForms={isLoadingForms}
            onDeleteClick={onDeleteClick}
          />
        );
      })}
    </div>
  );
};

export default PlayersGrid;
