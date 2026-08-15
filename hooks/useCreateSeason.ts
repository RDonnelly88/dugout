import { useRouter } from "next/navigation";



import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSeason } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";

export const useCreateSeason = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useTeam();

  const createSeasonMutation = useMutation({
    mutationFn: (seasonData: any) => addSeason(seasonData),
    onSuccess: (data) => {
      console.log("Season created successfully:", data);
      
      // Force invalidate all team-specific queries to ensure data is refreshed
      if (currentTeam) {
        queryClient.invalidateQueries({ queryKey: ['seasons'] });
        queryClient.invalidateQueries({ queryKey: ['currentSeason'] });
        console.log("Invalidated queries after season creation for team:", currentTeam.id);
      }
      
      toast({
        title: "Season created",
        description: "The season has been created successfully."
      });
      
      // Navigate to the newly created season
      router.push(`/seasons/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Error creating season:", error);
      toast({
        title: "Error",
        description: "Failed to create the season. Please try again.",
        variant: "destructive"
      });
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
    
    console.log(`Creating season for team: ${currentTeam.id} with values:`, values);
    
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
