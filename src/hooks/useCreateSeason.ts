
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSeason } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";

export const useCreateSeason = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useTeam();

  const createSeasonMutation = useMutation({
    mutationFn: (seasonData: any) => addSeason(seasonData),
    onSuccess: (data) => {
      // Invalidate all team-specific queries to ensure data is refreshed
      queryClient.invalidateQueries({ queryKey: ['seasons', currentTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['currentSeason', currentTeam?.id] });
      
      toast({
        title: "Season created",
        description: "The season has been created successfully."
      });
      navigate(`/seasons/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create the season. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating season:", error);
    }
  });

  const handleSubmit = (values: any) => {
    if (!currentTeam) {
      toast({
        title: "No team selected",
        description: "You must select a team before creating a season.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Creating season for team: ${currentTeam.id}`);
    
    createSeasonMutation.mutate({
      name: values.name,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : null,
      isCurrent: values.isCurrent,
      teamId: currentTeam.id
    });
  };

  return {
    createSeasonMutation,
    handleSubmit
  };
};
