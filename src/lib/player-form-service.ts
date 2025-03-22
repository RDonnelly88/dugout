
import { PlayerFormResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch } from "./supabase-utils";

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

// Cache for player form data to improve performance
const formDataCache: Record<string, { data: PlayerFormResult[], timestamp: number }> = {};
const batchFormDataCache: Record<string, { data: Record<string, PlayerFormResult[]>, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

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
  const cacheKey = `form_${seasonId}_${playerId}`;
  
  // Check cache first
  const cached = formDataCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached form data for player ${playerId} in season ${seasonId}`);
    return cached.data;
  }
  
  try {
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
        teamA,
        teamB
      };
    });

    // Filter matches where player participated
    const playerMatches = matches.filter(
      match => 
        (match.teamA.players && match.teamA.players.includes(playerId)) || 
        (match.teamB.players && match.teamB.players.includes(playerId))
    );

    // Calculate results
    const results = playerMatches.map(match => {
      const isTeamA = match.teamA.players && match.teamA.players.includes(playerId);
      
      if (match.teamA.score === match.teamB.score) {
        return 'draw';
      }
      
      if (isTeamA) {
        return match.teamA.score > match.teamB.score ? 'win' : 'loss';
      } else {
        return match.teamB.score > match.teamA.score ? 'win' : 'loss';
      }
    });
    
    // Store in cache
    formDataCache[cacheKey] = {
      data: results,
      timestamp: Date.now()
    };
    
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
  
  // Generate batch cache key
  const batchCacheKey = `batch_${seasonId}_${playerIds.sort().join('_')}`;
  
  // Check batch cache first
  const batchCached = batchFormDataCache[batchCacheKey];
  if (batchCached && Date.now() - batchCached.timestamp < CACHE_TTL) {
    console.log(`Using cached batch form data for season ${seasonId} with ${playerIds.length} players`);
    return batchCached.data;
  }
  
  // Check individual player caches
  const result: Record<string, PlayerFormResult[]> = {};
  let allCached = true;
  
  for (const playerId of playerIds) {
    const cacheKey = `form_${seasonId}_${playerId}`;
    const cached = formDataCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      result[playerId] = cached.data;
    } else {
      allCached = false;
      break;
    }
  }
  
  if (allCached && Object.keys(result).length === playerIds.length) {
    return result;
  }
  
  try {
    // Fetch all completed matches for this season in a single query
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
        teamA,
        teamB
      };
    });

    // Process all players at once
    const batchResult: Record<string, PlayerFormResult[]> = {};
    
    for (const playerId of playerIds) {
      // Filter matches where this player participated
      const playerMatches = matches.filter(
        match => 
          (match.teamA.players && match.teamA.players.includes(playerId)) || 
          (match.teamB.players && match.teamB.players.includes(playerId))
      );
      
      // Calculate results
      const playerResults = playerMatches.map(match => {
        const isTeamA = match.teamA.players && match.teamA.players.includes(playerId);
        
        if (match.teamA.score === match.teamB.score) {
          return 'draw';
        }
        
        if (isTeamA) {
          return match.teamA.score > match.teamB.score ? 'win' : 'loss';
        } else {
          return match.teamB.score > match.teamA.score ? 'win' : 'loss';
        }
      });
      
      // Store in individual cache and in result
      formDataCache[`form_${seasonId}_${playerId}`] = {
        data: playerResults,
        timestamp: Date.now()
      };
      batchResult[playerId] = playerResults;
    }
    
    // Store batch result in cache
    batchFormDataCache[batchCacheKey] = {
      data: batchResult,
      timestamp: Date.now()
    };
    
    return batchResult;
  } catch (error) {
    console.error("Error in getPlayerFormBatch:", error);
    return {};
  }
};
