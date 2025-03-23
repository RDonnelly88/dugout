
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch } from "../supabase-utils";

// Get matches from Supabase for a specific team
export const getMatches = async (): Promise<Match[]> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return empty array
    if (!currentTeamId) {
      console.log("No team selected, returning empty matches array");
      return [];
    }
    
    console.log("Fetching matches for team:", currentTeamId);
    
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("team_id", currentTeamId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} matches for team ${currentTeamId}`);
    
    // Map data to ensure it matches the Match type
    return (data || []).map(mapSupabaseMatchToMatch);
  } catch (error) {
    console.error("Error fetching matches:", error);
    // Fallback to localStorage but filter by team
    try {
      const matches = localStorage.getItem("football-tracker-matches");
      const parsedMatches = matches ? JSON.parse(matches) : [];
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (!currentTeamId) return [];
      
      // Filter matches by team ID
      return parsedMatches.filter((match: any) => match.team_id === currentTeamId);
    } catch (err) {
      return [];
    }
  }
};

// Get a single match by ID
export const getMatch = async (id: string): Promise<Match | undefined> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return undefined
    if (!currentTeamId) {
      console.log("No team selected, cannot fetch match");
      return undefined;
    }
    
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .eq("team_id", currentTeamId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching match:", error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map data to ensure it matches the Match type
    return mapSupabaseMatchToMatch(data);
  } catch (error) {
    console.error("Error fetching match:", error);
    // Fallback to localStorage but filter by team
    try {
      const matches = localStorage.getItem("football-tracker-matches");
      const parsedMatches = matches ? JSON.parse(matches) : [];
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (!currentTeamId) return undefined;
      
      // Find match by ID and verify it belongs to current team
      const match = parsedMatches.find((m: any) => m.id === id);
      return match && match.team_id === currentTeamId ? match : undefined;
    } catch (err) {
      return undefined;
    }
  }
};
