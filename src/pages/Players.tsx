
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, deletePlayer } from "@/lib/db";
import { Player } from "@/types";
import { Plus, Search, Trophy, Edit, Trash2, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

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

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Players</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your player roster
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px]"
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
            <Card key={i} className="shimmer h-[200px]" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="player-card hover-scale overflow-hidden">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-5 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-medium text-primary">
                        {player.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium truncate">{player.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Trophy className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {player.stats.won} wins in {player.stats.played} games
                      </span>
                    </div>
                  </div>
                </div>

                <div className="player-stats grid grid-cols-4 p-3 bg-muted/30 border-t mt-auto">
                  <div className="stat-item">
                    <span className="text-xs text-muted-foreground">Played</span>
                    <span className="font-semibold">{player.stats.played}</span>
                  </div>
                  <div className="stat-item">
                    <span className="text-xs text-muted-foreground">Won</span>
                    <span className="font-semibold text-green-600">{player.stats.won}</span>
                  </div>
                  <div className="stat-item">
                    <span className="text-xs text-muted-foreground">Lost</span>
                    <span className="font-semibold text-red-600">{player.stats.lost}</span>
                  </div>
                  <div className="stat-item">
                    <span className="text-xs text-muted-foreground">Drawn</span>
                    <span className="font-semibold text-blue-600">{player.stats.drawn}</span>
                  </div>
                </div>

                <div className="flex border-t">
                  <Link 
                    to={`/players/${player.id}`} 
                    className="flex-1 py-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    View
                  </Link>
                  <div className="w-px bg-border"></div>
                  <Link 
                    to={`/players/edit/${player.id}`} 
                    className="flex-1 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </Link>
                  <div className="w-px bg-border"></div>
                  <button 
                    onClick={() => handleDeleteClick(player)} 
                    className="flex-1 py-3 text-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
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
