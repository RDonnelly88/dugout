
import { PlayerFormResult } from "@/types";
import { supabase } from "@/lib/supabase-browser";

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
      .select("id, date, team_a, team_b, status")
      .eq("season_id", seasonId)
      .eq("team_id", currentTeamId)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(5);
    
    if (matchesError) {
      console.error("Error fetching season matches:", matchesError);
      return [];
    }
    
    if (!matches || matches.length === 0) {
      return [];
    }
    
    // For each match, check if the player participated and what the result was
    const playerForm: PlayerFormResult[] = [];
    
    for (const match of matches) {
      // Check if player was in team A or team B
      const teamA = match.team_a as { players: string[], score?: number };
      const teamB = match.team_b as { players: string[], score?: number };
      
      const isInTeamA = teamA.players?.includes(playerId);
      const isInTeamB = teamB.players?.includes(playerId);
      
      if (!isInTeamA && !isInTeamB) {
        // Player didn't participate in this match
        playerForm.push('dnp');
      } else {
        // Player participated, determine the result
        const teamAScore = teamA.score || 0;
        const teamBScore = teamB.score || 0;
        
        if (teamAScore === teamBScore) {
          playerForm.push('draw');
        } else if (
          (isInTeamA && teamAScore > teamBScore) || 
          (isInTeamB && teamBScore > teamAScore)
        ) {
          playerForm.push('win');
        } else {
          playerForm.push('loss');
        }
      }
    }
    
    return playerForm;
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
      .select("id, date, team_a, team_b, status")
      .eq("season_id", seasonId)
      .eq("team_id", currentTeamId)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(5);
    
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
    for (const match of matches) {
      const teamA = match.team_a as { players: string[], score?: number };
      const teamB = match.team_b as { players: string[], score?: number };
      const teamAScore = teamA.score || 0;
      const teamBScore = teamB.score || 0;
      
      for (const playerId of playerIds) {
        const isInTeamA = teamA.players?.includes(playerId);
        const isInTeamB = teamB.players?.includes(playerId);
        
        if (!isInTeamA && !isInTeamB) {
          // Player didn't participate in this match
          results[playerId].push('dnp');
        } else {
          // Player participated, determine the result
          if (teamAScore === teamBScore) {
            results[playerId].push('draw');
          } else if (
            (isInTeamA && teamAScore > teamBScore) || 
            (isInTeamB && teamBScore > teamAScore)
          ) {
            results[playerId].push('win');
          } else {
            results[playerId].push('loss');
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error loading batch player forms:", error);
    return {};
  }
};
