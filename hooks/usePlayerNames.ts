import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { shortNames } from "@/lib/short-names";

/**
 * Names for player ids, in full and in the short form a tight line uses.
 *
 * Off the same players query every other page holds, so a list of fifty
 * matches asks for nothing new.
 */
export function usePlayerNames() {
  const { currentTeam } = useTeam();
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  return useMemo(() => {
    const full = new Map(players.map((p) => [p.id, p.name]));
    const short = shortNames(players);
    return {
      fullName: (id: string) => full.get(id) ?? "Unknown",
      shortName: (id: string) => short.get(id) ?? full.get(id) ?? "Unknown",
    };
  }, [players]);
}
