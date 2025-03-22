
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch } from "../supabase-utils";

// Get matches from Supabase
export const getMatches = async (): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
    
    // Map data to ensure it matches the Match type
    return (data || []).map(mapSupabaseMatchToMatch);
  } catch (error) {
    console.error("Error fetching matches:", error);
    // Fallback to localStorage
    const matches = localStorage.getItem("football-tracker-matches");
    return matches ? JSON.parse(matches) : [];
  }
};

// Get a single match by ID
export const getMatch = async (id: string): Promise<Match | undefined> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
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
    // Fallback to localStorage
    const matches = localStorage.getItem("football-tracker-matches");
    const parsedMatches = matches ? JSON.parse(matches) : [];
    return parsedMatches.find((match: Match) => match.id === id);
  }
};
