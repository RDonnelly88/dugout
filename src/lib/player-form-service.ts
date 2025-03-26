
import { PlayerFormResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch a batch of player forms in a single request
export const getPlayerFormBatch = async (
  seasonId: string,
  playerIds: string[]
): Promise<Record<string, PlayerFormResult[]>> => {
  if (!seasonId || !playerIds.length) {
    return {};
  }
  
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    if (!currentTeamId) {
      console.log("No team selected, returning empty player forms");
      return {};
    }
    
    console.log(`Fetching fresh batch form data for season ${seasonId} with ${playerIds.length} players at ${new Date().toISOString()}`);
    
    // First verify this season belongs to current team
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("team_id")
      .eq("id", seasonId)
      .eq("team_id", currentTeamId)
      .maybeSingle();
    
    if (seasonError || !seasonData) {
      console.error("Error verifying season or season not found:", seasonError);
      return {};
    }
    
    if (seasonData.team_id !== currentTeamId) {
      console.log("Season doesn't belong to current team");
      return {};
    }
    
    // Get results for all players in a single query
    const { data, error } = await supabase
      .from("player_match_results")
      .select("*")
      .eq("season_id", seasonId)
      .in("player_id", playerIds)
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Error fetching batch player forms:", error);
      return {};
    }
    
    // Group results by player ID
    const results: Record<string, PlayerFormResult[]> = {};
    playerIds.forEach(playerId => {
      // Initialize with empty array for each player
      results[playerId] = [];
    });
    
    // Fill in results
    data?.forEach(item => {
      if (item.player_id && item.result) {
        if (!results[item.player_id]) {
          results[item.player_id] = [];
        }
        // Only take the 5 most recent results
        if (results[item.player_id].length < 5) {
          results[item.player_id].push(item.result as PlayerFormResult);
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error("Error loading batch player forms:", error);
    return {};
  }
};
