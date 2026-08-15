import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayerRecords, emptyRecord } from "@/lib/player-stats";
import { useTeam } from "@/contexts/TeamContext";
import type { PlayerRecord } from "@/types";

/**
 * Every player's all-time record, keyed by id.
 *
 * One query for the whole squad rather than one per player: a grid of twelve
 * cards would otherwise open twelve connections to answer the same question,
 * and they would arrive at different moments and briefly disagree on screen.
 *
 * The lookup is memoised on the data, so callers can list it as an effect or
 * memo dependency without that dependency changing on every render.
 */
export const usePlayerRecords = () => {
  const { currentTeam } = useTeam();

  const { data = [], isLoading } = useQuery({
    queryKey: ["playerRecords", currentTeam?.id],
    queryFn: getPlayerRecords,
    enabled: !!currentTeam,
  });

  const byId = useMemo(
    () => new Map<string, PlayerRecord>(data.map((r) => [r.playerId, r])),
    [data]
  );

  const recordFor = useCallback(
    /** Never undefined: an unplayed player is a record of zeroes. */
    (playerId: string, playerName = "") =>
      byId.get(playerId) ?? emptyRecord(playerId, playerName),
    [byId]
  );

  return { records: data, byId, recordFor, isLoading };
};
