import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPlayer, updatePlayer, deletePlayer } from "@/lib/db";
import { Player } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { useTeam } from "@/contexts/TeamContext";

export function usePlayerMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const { currentTeam } = useTeam();

  const addPlayerMutation = useMutation({
    mutationFn: (player: Omit<Player, "id" | "createdAt" | "updatedAt" | "stats" | "image">) => {
      if (!currentTeam) {
        throw new Error("No team selected");
      }
      
      // No opening tally to seed: a record is counted from matches, so a new
      // player already reads as nought played without anything being stored.
      return addPlayer({
        ...player,
        teamId: currentTeam.id,
        image: player.imageUrl || null
      });
    },
    onSuccess: (player) => {
      console.log("Player added successfully:", player);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player added",
        description: "The player has been added successfully.",
      });
      router.push(`/players/${player.id}`);
    },
    onError: (error: any) => {
      console.error("Failed to add player:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">> }) => {
      // Convert imageUrl to image for database storage
      const modifiedUpdates = { 
        ...updates,
        image: updates.imageUrl || updates.image
      };
      
      return updatePlayer(id, modifiedUpdates);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['player', variables.id] });
      }
      toast({
        title: "Player updated",
        description: "The player has been updated successfully.",
      });
      router.push("/players");
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
      router.push("/players");
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
