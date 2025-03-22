
import { Match } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { mapMatchToSupabase, mapSupabaseMatchToMatch } from "../supabase-utils";
import { getMatches } from "./match-retrieval";
import { getCurrentSeason } from "../season-service";

// Add a new match
export const addMatch = async (match: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match> => {
  const now = new Date().toISOString();
  
  // Ensure teamA and teamB have all required properties
  const matchWithFormattedTeams = {
    ...match,
    teamA: {
      name: match.teamA?.name || "Team A",
      players: match.teamA?.players || [],
      score: match.teamA?.score ?? 0
    },
    teamB: {
      name: match.teamB?.name || "Team B",
      players: match.teamB?.players || [],
      score: match.teamB?.score ?? 0
    }
  };
  
  // If no season is specified, try to get the current season
  if (!matchWithFormattedTeams.seasonId) {
    try {
      const currentSeason = await getCurrentSeason();
      if (currentSeason) {
        matchWithFormattedTeams.seasonId = currentSeason.id;
      }
    } catch (error) {
      console.error("Error getting current season:", error);
    }
  }
  
  const supabaseMatch = {
    ...mapMatchToSupabase(matchWithFormattedTeams),
    created_at: now,
    updated_at: now
  };
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .insert(supabaseMatch)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding match to Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const matchWithId = {
        id: uuidv4(),
        ...matchWithFormattedTeams,
        createdAt: now,
        updatedAt: now
      };
      matches.push(matchWithId);
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      return matchWithId;
    }
    
    // Map data to ensure it matches the Match type
    return mapSupabaseMatchToMatch(data);
  } catch (error) {
    console.error("Error adding match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const matchWithId = {
      id: uuidv4(),
      ...matchWithFormattedTeams,
      createdAt: now,
      updatedAt: now
    };
    matches.push(matchWithId);
    localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
    return matchWithId;
  }
};
