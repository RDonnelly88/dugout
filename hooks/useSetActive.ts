import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlayer } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/hooks/use-toast";
import type { Player } from "@/types";

/**
 * Mark a player active or not, without opening their edit form.
 *
 * The switch moves at once: the squad in the cache is updated before the
 * request goes, put back if it fails, and refetched either way so every page
 * — the list, the picker, the records — agrees with the database afterwards.
 */
export function useSetActive() {
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();
  const { toast } = useToast();
  const key = ["players", currentTeam?.id];

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updatePlayer(id, { isActive: active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Player[]>(key);
      queryClient.setQueryData<Player[]>(key, (squad) =>
        squad?.map((p) => (p.id === id ? { ...p, isActive: active } : p))
      );
      return { previous };
    },
    onError: (_error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast({
        title: "Couldn't change that",
        description: "Nothing was saved. Have another go in a moment.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["playerRecords"] });
    },
  });
}
