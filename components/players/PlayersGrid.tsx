import Link from "next/link";

import React from "react";

import { Player, PlayerFormResult, SeasonPlayerStats } from "@/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerCard from "./PlayerCard";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { useSquadForm } from "@/hooks/useSquadForm";
import { usePermission } from "@/lib/permission-utils";
import { scopeTo, type ActiveScope } from "./ActiveFilter";
import { orderPlayers, type PlayerSort } from "@/lib/player-order";

interface PlayersGridProps {
  players: Player[];
  currentSeasonId: string | null;
  seasonPlayerStats: SeasonPlayerStats[];
  onDeleteClick: (player: Player) => void;
  searchTerm: string;
  scope: ActiveScope;
  sort: PlayerSort;
}

const PlayersGrid: React.FC<PlayersGridProps> = ({
  players,
  currentSeasonId,
  seasonPlayerStats,
  onDeleteClick,
  searchTerm,
  scope,
  sort,
}) => {
  // One query for the whole grid. Asking per card would open a dozen requests
  // for the same answer and let them arrive at different moments.
  const { recordFor } = usePlayerRecords();
  // Likewise the ratings: the hook replays the entire match history, so a card
  // calling it for itself would replay it once per player on screen.
  const { ratingFor, all } = usePlayerRatings();
  // Not the season's form: the squad list is not a season view, so it shows
  // how people have been going lately whatever the calendar says.
  const { formFor, isLoading: isLoadingForms } = useSquadForm();
  const { canManage, ready } = usePermission();
  const editable = ready && canManage();

  // Where each rating sits within the squad's own spread. Elo has no absolute
  // meaning — 1250 is strong in one group and ordinary in another — so a card
  // can only be coloured relative to the people it is shown beside.
  const standingFor = React.useMemo(() => {
    const values = all.map((r) => r.rating);
    if (values.length < 2) return () => undefined;
    const low = Math.min(...values);
    const span = Math.max(...values) - low;
    if (span === 0) return () => undefined;
    return (playerId: string) => {
      const rating = all.find((r) => r.playerId === playerId);
      return rating ? (rating.rating - low) / span : undefined;
    };
  }, [all]);

  const filteredPlayers = React.useMemo(() => {
    const matching = scopeTo(players, scope).filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return orderPlayers(
      matching.map((player) => {
        const record = recordFor(player.id, player.name);
        return {
          ...player,
          rating: ratingFor(player.id),
          form: formFor(player.id),
          played: record.played,
          wins: record.wins,
        };
      }),
      sort
    );
  }, [players, scope, searchTerm, sort, formFor, recordFor, ratingFor]);

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
        {!searchTerm && players.length === 0 && editable && (
          <Button asChild>
            <Link href="/players/add">
              <Plus className="mr-2 h-4 w-4" />
              Add player
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Function to get player's season stats and form data
  const getPlayerSeasonData = (playerId: string): { seasonStats: SeasonPlayerStats | undefined, formResults: PlayerFormResult[] } => {
    const playerStats = seasonPlayerStats.find(stat => stat.playerId === playerId);
    const formResults = formFor(playerId);
    
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
            rating={ratingFor(player.id)}
            standing={standingFor(player.id)}
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
