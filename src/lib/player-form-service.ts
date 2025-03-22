
import { PlayerFormResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Type for the raw match data from Supabase
interface RawMatchData {
  id: string;
  date: string;
  location?: string;
  status: string;
  season_id?: string;  // Using snake_case to match Supabase column names
  team_a: any;
  team_b: any;
}

// Type for the parsed team data
interface ParsedTeam {
  players: string[];
  score?: number;
  name: string;
}

// Function to safely parse team data from JSON
function parseTeamData(teamData: any, defaultName: string): ParsedTeam {
  // Default team structure if parsing fails
  const defaultTeam: ParsedTeam = { 
    players: [], 
    name: defaultName 
  };
  
  if (!teamData) return defaultTeam;
  
  try {
    // If the data is already an object, use it directly
    if (typeof teamData === 'object') {
      return {
        players: Array.isArray(teamData.players) ? teamData.players : [],
        score: typeof teamData.score === 'number' ? teamData.score : undefined,
        name: typeof teamData.name === 'string' ? teamData.name : defaultName
      };
    }
    
    // Try to parse it if it's a string
    if (typeof teamData === 'string') {
      const parsed = JSON.parse(teamData);
      return {
        players: Array.isArray(parsed.players) ? parsed.players : [],
        score: typeof parsed.score === 'number' ? parsed.score : undefined,
        name: typeof parsed.name === 'string' ? parsed.name : defaultName
      };
    }
  } catch (e) {
    console.error("Error parsing team data:", e);
  }
  
  return defaultTeam;
}

// Get a player's form in a specific season
export const getPlayerFormInSeason = async (
  seasonId: string,
  playerId: string
): Promise<PlayerFormResult[]> => {
  console.log(`Fetching fresh form data for player ${playerId} in season ${seasonId}`);
  
  try {
    // Add a cache-busting parameter
    const timestamp = new Date().getTime();
    
    const { data: matchesData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("season_id", seasonId)
      .eq("status", "completed")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching player form:", error);
      return [];
    }

    // Map the raw data to our expected format with proper typing
    const matches = (matchesData || []).map(match => {
      // Parse the team data safely
      const teamA = parseTeamData(match.team_a, "Team A");
      const teamB = parseTeamData(match.team_b, "Team B");
      
      return {
        id: match.id,
        date: match.date,
        teamA,
        teamB
      };
    });

    // Sort matches by date (newest first)
    matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get the five most recent matches in the season
    const recentMatches = matches.slice(0, 5);
    
    // Calculate results for recent matches
    const results = recentMatches.map(match => {
      // Check if player participated in this match
      const playerInTeamA = match.teamA.players && match.teamA.players.includes(playerId);
      const playerInTeamB = match.teamB.players && match.teamB.players.includes(playerId);
      
      // If player didn't participate, mark as DNP
      if (!playerInTeamA && !playerInTeamB) {
        return 'dnp';
      }
      
      // Player participated, determine win/loss/draw
      const isTeamA = playerInTeamA;
      
      if (match.teamA.score === match.teamB.score) {
        return 'draw';
      }
      
      if (isTeamA) {
        return match.teamA.score > match.teamB.score ? 'win' : 'loss';
      } else {
        return match.teamB.score > match.teamA.score ? 'win' : 'loss';
      }
    });
    
    return results;
  } catch (error) {
    console.error("Error in getPlayerFormInSeason:", error);
    return [];
  }
};

// Optimized function to fetch form data for multiple players in a single batch
export const getPlayerFormBatch = async (
  seasonId: string,
  playerIds: string[]
): Promise<Record<string, PlayerFormResult[]>> => {
  if (!playerIds.length) return {};
  
  console.log(`Fetching fresh batch form data for season ${seasonId} with ${playerIds.length} players at ${new Date().toISOString()}`);
  
  try {
    // Add a cache-busting parameter to ensure fresh data
    const timestamp = new Date().getTime();
    
    const { data: matchesData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("season_id", seasonId)
      .eq("status", "completed")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching matches for player forms:", error);
      return {};
    }

    // Map the raw data to our expected format with proper typing
    const matches = (matchesData || []).map(match => {
      // Parse the team data safely
      const teamA = parseTeamData(match.team_a, "Team A");
      const teamB = parseTeamData(match.team_b, "Team B");
      
      return {
        id: match.id,
        date: match.date,
        teamA,
        teamB
      };
    });
    
    // Sort matches by date (newest first)
    matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get the five most recent matches in the season
    const recentMatches = matches.slice(0, 5);

    // Process all players at once
    const batchResult: Record<string, PlayerFormResult[]> = {};
    
    for (const playerId of playerIds) {
      // Calculate results for the player's recent matches
      const playerResults = recentMatches.map(match => {
        // Check if player participated in this match
        const playerInTeamA = match.teamA.players && match.teamA.players.includes(playerId);
        const playerInTeamB = match.teamB.players && match.teamB.players.includes(playerId);
        
        // If player didn't participate, mark as DNP
        if (!playerInTeamA && !playerInTeamB) {
          return 'dnp';
        }
        
        // Player participated, determine win/loss/draw
        const isTeamA = playerInTeamA;
        
        if (match.teamA.score === match.teamB.score) {
          return 'draw';
        }
        
        if (isTeamA) {
          return match.teamA.score > match.teamB.score ? 'win' : 'loss';
        } else {
          return match.teamB.score > match.teamA.score ? 'win' : 'loss';
        }
      });
      
      batchResult[playerId] = playerResults;
    }
    
    return batchResult;
  } catch (error) {
    console.error("Error in getPlayerFormBatch:", error);
    return {};
  }
};
