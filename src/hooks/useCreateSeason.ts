
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSeason } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export const useCreateSeason = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSeasonMutation = useMutation({
    mutationFn: (seasonData: any) => addSeason(seasonData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
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
    createSeasonMutation.mutate({
      name: values.name,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : null,
      isCurrent: values.isCurrent
    });
  };

  return {
    createSeasonMutation,
    handleSubmit
  };
};
