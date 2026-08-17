import { supabase } from "@/lib/supabase-browser";
import type { PlayerRecord } from "@/types";

/**
 * A player's all-time record, straight from the `player_stats` view.
 *
 * This is the only place the app asks what a player has done. Every surface
 * that shows a played/won/drawn/lost figure — the card, the detail page, the
 * randomiser, the hover panel — reads it from here, so two of them cannot
 * disagree. Anything that needs it broken down by season reads
 * `season_player_stats`, which is the same arithmetic with the season kept.
 *
 * Nothing writes it. The numbers are derived from completed matches, so
 * entering a result updates every one of them at once and there is no cache to
 * fall out of step.
 */
export const getPlayerRecords = async (): Promise<PlayerRecord[]> => {
  const currentTeamId = localStorage.getItem("currentTeamId");
  if (!currentTeamId) return [];

  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("team_id", currentTeamId);

  if (error) {
    console.error("Error fetching player records:", error);
    return [];
  }

  return (data ?? []).flatMap((row) =>
    row.player_id
      ? [
          {
            playerId: row.player_id,
            playerName: row.player_name ?? "",
            playerImage: row.player_image,
            isActive: row.is_active ?? true,
            played: row.played ?? 0,
            wins: row.wins ?? 0,
            draws: row.draws ?? 0,
            losses: row.losses ?? 0,
            points: row.points ?? 0,
          },
        ]
      : []
  );
};

// Re-exported so every caller still imports a record's arithmetic from the
// same place, without that import pulling a database client along with it.
export { winRate, emptyRecord } from "./player-record";
