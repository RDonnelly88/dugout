
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, deletePlayer, getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { Player, PlayerFormResult, SeasonPlayerStats } from "@/types";
import { Plus, Search, Trophy, Edit, Trash2, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import PlayerForm from "@/components/players/PlayerForm";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  // Fetch current season
  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });

  // Fetch season stats for players if current season exists
  const { data: seasonPlayerStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['seasonPlayerStats', currentSeason?.id],
    queryFn: () => getSeasonPlayerStats(currentSeason!.id),
    enabled: !!currentSeason,
    staleTime: 0
  });

  // Get player ranks and forms for the current season
  const getPlayerRankAndForm = (playerId: string): { rank: number, form: PlayerFormResult[] } => {
    if (!seasonPlayerStats.length) {
      return { rank: 0, form: [] };
    }
    
    // Sort by points (desc), then wins (desc)
    const sortedStats = [...seasonPlayerStats].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.wins - a.wins;
    });
    
    const playerIndex = sortedStats.findIndex(stat => stat.playerId === playerId);
    if (playerIndex === -1) {
      return { rank: 0, form: [] };
    }
    
    return { 
      rank: playerIndex + 1,
      // This would need a real implementation to get form
      form: playerIndex === 0 ? ['win', 'win', 'loss'] : 
            playerIndex === 1 ? ['win', 'draw'] : 
            playerIndex === 2 ? ['win', 'loss', 'loss'] : []
    };
  };

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

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isLoadingPlayers || isLoadingSeason || isLoadingStats;

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Players</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your player roster
        </p>
      </div>

      {/* Current Season Summary Card */}
      {currentSeason && (
        <Card className="mb-6 bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-amber-400" />
              Current Season: {currentSeason.name}
            </CardTitle>
            <CardDescription>
              {new Date(currentSeason.startDate).toLocaleDateString()} - 
              {currentSeason.endDate ? new Date(currentSeason.endDate).toLocaleDateString() : " Ongoing"}
              {currentSeason.isFinished && <Badge className="ml-2 bg-red-500">Finished</Badge>}
              {currentSeason.isCurrent && !currentSeason.isFinished && <Badge className="ml-2 bg-green-500">Active</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">
                  {seasonPlayerStats.length} Active Players
                </span>
              </div>
              <div>
                <Button variant="link" size="sm" asChild className="text-blue-400 p-0">
                  <Link to={`/seasons/${currentSeason.id}`}>View League Table</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px] bg-gray-900 border-gray-800"
          />
        </div>
        <Button asChild>
          <Link to="/players/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shimmer h-[200px] bg-gray-900 border-gray-800" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => {
            const { rank, form } = getPlayerRankAndForm(player.id);
            return (
              <Card key={player.id} className="player-card hover-scale overflow-hidden bg-gray-900 border-gray-800">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-5 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {player.image ? (
                        <img
                          src={player.image}
                          alt={player.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-medium text-blue-400">
                          {player.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium truncate">{player.name}</h3>
                        {rank > 0 && currentSeason && (
                          <Badge className="bg-gray-800 text-white">
                            #{rank} in League
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="text-sm text-muted-foreground">
                          {player.stats.won} wins in {player.stats.played} games
                        </div>
                        {form.length > 0 && (
                          <PlayerForm form={form} size="sm" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="player-stats grid grid-cols-4 p-3 bg-gray-800 border-t mt-auto">
                    <div className="stat-item">
                      <span className="text-xs text-muted-foreground">Played</span>
                      <span className="font-semibold">{player.stats.played}</span>
                    </div>
                    <div className="stat-item">
                      <span className="text-xs text-muted-foreground">Won</span>
                      <span className="font-semibold text-green-400">{player.stats.won}</span>
                    </div>
                    <div className="stat-item">
                      <span className="text-xs text-muted-foreground">Lost</span>
                      <span className="font-semibold text-red-400">{player.stats.lost}</span>
                    </div>
                    <div className="stat-item">
                      <span className="text-xs text-muted-foreground">Drawn</span>
                      <span className="font-semibold text-amber-400">{player.stats.drawn}</span>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-800">
                    <Link 
                      to={`/players/${player.id}`} 
                      className="flex-1 py-3 text-center text-sm font-medium text-blue-400 hover:bg-gray-800 transition-colors"
                    >
                      View
                    </Link>
                    <div className="w-px bg-gray-800"></div>
                    <Link 
                      to={`/players/edit/${player.id}`} 
                      className="flex-1 py-3 text-center text-sm font-medium text-blue-400 hover:bg-gray-800 transition-colors"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>
                    <div className="w-px bg-gray-800"></div>
                    <button 
                      onClick={() => handleDeleteClick(player)} 
                      className="flex-1 py-3 text-center text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No players match your search" : "No players added yet"}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link to="/players/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Player
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {playerToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Players;
