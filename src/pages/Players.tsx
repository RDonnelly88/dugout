
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, deletePlayer, getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import DeletePlayerDialog from "@/components/players/DeletePlayerDialog";
import CurrentSeasonCard from "@/components/players/CurrentSeasonCard";
import PlayerSearchBar from "@/components/players/PlayerSearchBar";
import PlayersGrid from "@/components/players/PlayersGrid";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });

  const { data: seasonPlayerStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['seasonPlayerStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason,
    staleTime: 60000
  });

  // Get all player IDs for the current season
  const playerIds = currentSeason ? players.map(player => player.id) : [];
  
  // Use batch form loader for current season
  const { formData: batchFormData, isLoading: isLoadingForms } = useBatchFormLoader(
    currentSeason?.id || null, 
    playerIds
  );

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
      <div className="page-header">
        <h1 className="page-title">Players</h1>
        <p className="mt-2 text-muted-foreground">
          Manage Players
        </p>
      </div>

      {currentSeason && (
        <CurrentSeasonCard 
          currentSeason={currentSeason} 
          seasonPlayerStats={seasonPlayerStats} 
        />
      )}

      <PlayerSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shimmer h-[200px] bg-gray-900 border-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <PlayersGrid
          players={players}
          currentSeasonId={currentSeason?.id || null}
          seasonPlayerStats={seasonPlayerStats}
          batchFormData={batchFormData}
          isLoadingForms={isLoadingForms}
          onDeleteClick={handleDeleteClick}
          searchTerm={searchTerm}
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
