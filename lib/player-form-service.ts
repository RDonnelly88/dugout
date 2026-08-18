
import { Match, PlayerFormResult } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabaseMatchToMatch } from "@/lib/supabase-utils";
import { resultFor } from "@/lib/match-result";
import { FORM_LENGTH } from "@/lib/config";

/**
 * How a match went for one player, or `dnp` if they were not in it.
 *
 * Asks `resultFor` rather than comparing the two scores, because a five-a-side
 * result is who won and the score is optional detail on top. Comparing scores
 * read every match nobody wrote the goals down for as a nil-nil draw, and put
 * a D on the card of a player who had won.
 */
const formResult = (match: Match, playerId: string): PlayerFormResult =>
  resultFor(match, playerId) ?? "dnp";

/** Enough of a match row to read a result off. */
const FORM_COLUMNS = "id, date, team_a, team_b, status, outcome";

// Function to get a player's form data for a specific season
export const getPlayerFormInSeason = async (
  seasonId: string,
  playerId: string
): Promise<PlayerFormResult[]> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return empty array
    if (!currentTeamId) {
      console.log("No team selected, returning empty player form");
      return [];
    }
    
    // First, verify this season belongs to the current team
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("team_id")
      .eq("id", seasonId)
      .eq("team_id", currentTeamId)  // Critical security check
      .maybeSingle();
    
    if (seasonError || !seasonData) {
      console.error("Error verifying season or season not found:", seasonError);
      return [];
    }
    
    // If season doesn't belong to current team, return empty array
    if (seasonData.team_id !== currentTeamId) {
      console.log("Season doesn't belong to current team");
      return [];
    }
    
    // Get the last 5 matches in the season (not the last 5 matches the player played)
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(FORM_COLUMNS)
      .eq("season_id", seasonId)
      .eq("team_id", currentTeamId)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(FORM_LENGTH);
    
    if (matchesError) {
      console.error("Error fetching season matches:", matchesError);
      return [];
    }
    
    if (!matches || matches.length === 0) {
      return [];
    }
    
    return matches.map((row) =>
      formResult(mapSupabaseMatchToMatch(row), playerId)
    );
  } catch (error) {
    console.error("Error fetching player form:", error);
    return [];
  }
};

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
    
    // Get the last 5 completed matches in the season
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(FORM_COLUMNS)
      .eq("season_id", seasonId)
      .eq("team_id", currentTeamId)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(FORM_LENGTH);
    
    if (matchesError) {
      console.error("Error fetching season matches:", matchesError);
      return {};
    }
    
    if (!matches || matches.length === 0) {
      return {};
    }
    
    // Initialize results for all players
    const results: Record<string, PlayerFormResult[]> = {};
    playerIds.forEach(playerId => {
      results[playerId] = [];
    });
    
    // For each match, determine each player's participation and result
    for (const row of matches) {
      const match = mapSupabaseMatchToMatch(row);
      for (const playerId of playerIds) {
        results[playerId].push(formResult(match, playerId));
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error loading batch player forms:", error);
    return {};
  }
};
