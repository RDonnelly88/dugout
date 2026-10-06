import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayer, getMatches, getSeasons } from "@/lib/db";
import { Match } from "@/types";
import { useTeam } from "@/contexts/TeamContext";
import { resultFor, sideOf } from "@/lib/match-result";

/**
 * What a player's page reads: the player, and the squad's matches and seasons
 * — every figure on the page is worked out from those, season records
 * included, rather than fetched a season at a time.
 */
export const usePlayerDetail = () => {
  const { currentTeam } = useTeam();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id!),
    enabled: !!id,
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
  });

  /**
   * Which side the player was on, and how it went for them.
   *
   * Read through `sideOf` and `resultFor`, like everywhere else, so a result
   * recorded without a score still counts. Undefined for a match they were not
   * in, which leaves the row to read as the squad's.
   */
  const viewpointOf = useCallback(
    (match: Match) => {
      const side = id ? sideOf(match, id) : null;
      return side ? { side, result: resultFor(match, id!) } : undefined;
    },
    [id]
  );

  return {
    player,
    /** Every match the team has played, for anything that replays the history. */
    allMatches: matches,
    seasons,
    viewpointOf,
    isLoading: isLoadingPlayer || isLoadingMatches || isLoadingSeasons,
    router,
  };
};
