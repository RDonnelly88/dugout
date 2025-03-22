
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSeason, 
  getSeasons,
  getSeasonPlayerStats, 
  getMatches,
  getPlayerFormInSeason,
  updateSeason,
  deleteSeason
} from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { PlayerFormResult } from "@/types";

export const useSeasonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current season data
  const { data: season, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['seasons', id],
    queryFn: () => getSeason(id!),
    enabled: !!id
  });

  // Get all seasons for the selector
  const { data: seasons = [] } = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons
  });

  // Get player stats for this season
  const { data: playerStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['seasonPlayerStats', id],
    queryFn: () => getSeasonPlayerStats(id!),
    enabled: !!id,
    staleTime: 0, // Don't cache results to ensure fresh data
    refetchOnWindowFocus: true // Refetch when window gets focus
  });

  console.log("Season player stats:", playerStats);

  // Get matches for this season
  const { data: allMatches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
    staleTime: 0 // Don't cache results
  });

  // Filter matches for this season
  const seasonMatches = allMatches.filter(match => match.seasonId === id);
  
  console.log("Season matches:", seasonMatches);

  // Get form for each player
  const [playerForms, setPlayerForms] = useState<Record<string, PlayerFormResult[]>>({});

  // Load player forms
  useQuery({
    queryKey: ['playerForms', id],
    queryFn: async () => {
      const forms: Record<string, PlayerFormResult[]> = {};
      
      for (const player of playerStats) {
        const form = await getPlayerFormInSeason(id!, player.playerId);
        forms[player.playerId] = form;
      }
      
      setPlayerForms(forms);
      return forms;
    },
    enabled: !!id && playerStats.length > 0,
    staleTime: 0 // Don't cache results
  });

  // Update season mutation
  const updateSeasonMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      updateSeason(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      toast({
        title: "Season updated",
        description: "The season has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update the season. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating season:", error);
    }
  });

  // Delete season mutation
  const deleteSeasonMutation = useMutation({
    mutationFn: (id: string) => deleteSeason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      toast({
        title: "Season deleted",
        description: "The season has been deleted successfully.",
      });
      navigate('/seasons');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete the season. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting season:", error);
    }
  });

  const handleUpdateSeason = (values: any) => {
    if (!season) return;
    
    updateSeasonMutation.mutate({
      id: season.id,
      updates: {
        name: values.name,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,
        isCurrent: values.isCurrent
      }
    });
  };

  const handleDeleteSeason = () => {
    if (!season) return;
    
    deleteSeasonMutation.mutate(season.id);
  };

  // Force a refetch of player stats when the component mounts
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['seasonPlayerStats', id] });
      queryClient.invalidateQueries({ queryKey: ['playerForms', id] });
    }
  }, [id, queryClient]);

  return {
    id,
    season,
    seasons,
    playerStats,
    playerForms,
    seasonMatches,
    isLoadingSeason,
    isLoadingStats,
    isLoadingMatches,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
    updateSeasonMutation,
    deleteSeasonMutation,
    handleUpdateSeason,
    handleDeleteSeason,
    navigate
  };
};
