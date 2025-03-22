
import { PlayerFormResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch } from "./supabase-utils";

// Type for the raw match data from Supabase
interface RawMatchData {
  id: string;
  date: string;
  location?: string;
  status: string;
  seasonId?: string;
  team_a: any;
  team_b: any;
}

// Type for the parsed team data
interface ParsedTeam {
  players: string[];
  score?: number;
  name: string;
}

// Get a player's form in a specific season
export const getPlayerFormInSeason = async (
  seasonId: string,
  playerId: string
): Promise<PlayerFormResult[]> => {
  try {
    const { data: matchesData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("seasonId", seasonId)
      .eq("status", "completed")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching player form:", error);
      return [];
    }

    // Map the raw data to our expected format with proper typing
    const matches = (matchesData || []).map(match => {
      // Parse the team data from JSON, ensuring we have the correct structure
      const teamA: ParsedTeam = typeof match.team_a === 'object' 
        ? (match.team_a as ParsedTeam) 
        : { players: [], name: "Team A" };
        
      const teamB: ParsedTeam = typeof match.team_b === 'object' 
        ? (match.team_b as ParsedTeam) 
        : { players: [], name: "Team B" };
      
      return {
        ...match,
        teamA,
        teamB
      } as {
        id: string;
        teamA: ParsedTeam;
        teamB: ParsedTeam;
      };
    });

    // Filter matches where player participated
    const playerMatches = matches.filter(
      match => 
        (match.teamA.players && match.teamA.players.includes(playerId)) || 
        (match.teamB.players && match.teamB.players.includes(playerId))
    );

    // Calculate results
    return playerMatches.map(match => {
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
  
  try {
    // Fetch all completed matches for this season in a single query
    const { data: matchesData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("seasonId", seasonId)
      .eq("status", "completed")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching matches for player forms:", error);
      return {};
    }

    // Map the raw data to our expected format with proper typing
    const matches = (matchesData || []).map(match => {
      // Parse the team data from JSON, ensuring we have the correct structure
      const teamA: ParsedTeam = typeof match.team_a === 'object' 
        ? (match.team_a as ParsedTeam) 
        : { players: [], name: "Team A" };
        
      const teamB: ParsedTeam = typeof match.team_b === 'object' 
        ? (match.team_b as ParsedTeam) 
        : { players: [], name: "Team B" };
      
      return {
        ...match,
        teamA,
        teamB
      } as {
        id: string;
        teamA: ParsedTeam;
        teamB: ParsedTeam;
      };
    });

    // Process all players at once
    const result: Record<string, PlayerFormResult[]> = {};
    
    for (const playerId of playerIds) {
      // Filter matches where this player participated
      const playerMatches = matches.filter(
        match => 
          (match.teamA.players && match.teamA.players.includes(playerId)) || 
          (match.teamB.players && match.teamB.players.includes(playerId))
      );
      
      // Calculate results
      result[playerId] = playerMatches.map(match => {
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
    }
    
    return result;
  } catch (error) {
    console.error("Error in getPlayerFormBatch:", error);
    return {};
  }
};
