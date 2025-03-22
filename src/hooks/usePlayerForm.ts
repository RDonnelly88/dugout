
import { useQuery } from "@tanstack/react-query";
import { getPlayerFormInSeason } from "@/lib/db";
import { PlayerFormResult } from "@/types";
import { useState, useEffect } from "react";

export const usePlayerForm = (seasonId: string | null, playerId: string | null) => {
  const [form, setForm] = useState<PlayerFormResult[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['playerForm', seasonId, playerId],
    queryFn: () => getPlayerFormInSeason(seasonId!, playerId!),
    enabled: !!seasonId && !!playerId,
    staleTime: 0
  });
  
  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);
  
  return {
    form,
    isLoading
  };
};
