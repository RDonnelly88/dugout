
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPlayer, updatePlayer, deletePlayer } from "@/lib/db";
import { Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function usePlayerMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const addPlayerMutation = useMutation({
    mutationFn: (player: Omit<Player, "id" | "createdAt" | "updatedAt">) => addPlayer(player),
    onSuccess: (player) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player added",
        description: "The player has been added successfully.",
      });
      navigate(`/players/${player.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">> }) => 
      updatePlayer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player updated",
        description: "The player has been updated successfully.",
      });
      navigate("/players");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deletePlayerMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player deleted",
        description: "The player has been deleted successfully.",
      });
      navigate("/players");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    addPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation
  };
}
