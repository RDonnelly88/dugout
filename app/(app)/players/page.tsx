"use client";


import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, deletePlayer, getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { Player } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import DeletePlayerDialog from "@/components/players/DeletePlayerDialog";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import PlayerSearchBar from "@/components/players/PlayerSearchBar";
import PlayersGrid from "@/components/players/PlayersGrid";
import { useTeam } from "@/contexts/TeamContext";
import { isActivePlayer, type ActiveScope } from "@/components/players/ActiveFilter";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import PlayerSort from "@/components/players/PlayerSort";
import type { PlayerSort as PlayerSortValue } from "@/lib/player-order";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scope, setScope] = useState<ActiveScope>("active");
  const [sort, setSort] = useState<PlayerSortValue>("rank");
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam
  });

  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['currentSeason', currentTeam?.id],
    queryFn: getCurrentSeason
  });

  const { data: seasonPlayerStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['seasonPlayerStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason,
    staleTime: 60000
  });

  const playerIds = currentSeason ? players.map(player => player.id) : [];

  const { formData: batchFormData, isLoading: isLoadingForms } = useBatchFormLoader(
    currentSeason?.id || null, 
    playerIds
  );

  useEffect(() => {
    if (currentSeason?.id) {
      queryClient.invalidateQueries({ 
        queryKey: ['batchPlayerForms', currentSeason.id] 
      });
    }
  }, [currentSeason?.id, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player deleted",
        description: "The player has been removed successfully.",
      });
      setPlayerToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deleteMutation.mutate(playerToDelete.id);
    }
  };

  const isLoading = isLoadingPlayers || isLoadingSeason || isLoadingStats;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Players"
        subtitle={
          <>
            The squad, their records and their form
          </>
        }
      />

      {currentSeason && (
        <CurrentSeasonCard 
          currentSeason={currentSeason} 
          seasonPlayerStats={seasonPlayerStats} 
        />
      )}

      <PlayerSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        scope={scope}
        setScope={setScope}
        counts={{
          active: players.filter(isActivePlayer).length,
          all: players.length,
        }}
      />

      <div className="mb-4">
        <PlayerSort value={sort} onChange={setSort} />
      </div>

      {isLoading ? (
        <PageLoading rows={4} label="Loading the squad" />
      ) : (
        <PlayersGrid
          players={players}
          currentSeasonId={currentSeason?.id || null}
          seasonPlayerStats={seasonPlayerStats}
          batchFormData={batchFormData}
          isLoadingForms={isLoadingForms}
          onDeleteClick={handleDeleteClick}
          searchTerm={searchTerm}
          scope={scope}
          sort={sort}
        />
      )}

      <DeletePlayerDialog
        isOpen={!!playerToDelete}
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Players;
