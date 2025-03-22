
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason } from "@/lib/db";
import { PlayerFormResult } from "@/types";
import { useState, useEffect } from "react";

export const usePlayerForm = (seasonId: string | null, playerId: string | null) => {
  const [form, setForm] = useState<PlayerFormResult[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['playerForm', seasonId, playerId],
    queryFn: () => getPlayerFormInSeason(seasonId!, playerId!),
    enabled: !!seasonId && !!playerId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  useEffect(() => {
    if (data) {
      // Make sure data is processed into the correct format
      setForm(data);
    }
  }, [data]);
  
  console.log("Player form data for", playerId, "in season", seasonId, ":", form);
  
  return {
    form,
    isLoading,
    error
  };
};
