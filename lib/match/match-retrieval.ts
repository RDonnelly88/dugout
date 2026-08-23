import { Match } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabaseMatchToMatch } from "../supabase-utils";

// Get matches from Supabase for a specific team
export const getMatches = async (): Promise<Match[]> => {
  // Get the current team ID from localStorage
  const currentTeamId = localStorage.getItem("currentTeamId");

  // If no team is selected, return empty array
  if (!currentTeamId) {
    console.log("No team selected, returning empty matches array");
    return [];
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("team_id", currentTeamId) // Critical: Only fetch matches for current team
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching matches:", error);
    return [];
  }

  // Map data to ensure it matches the Match type
  return (data || []).map(mapSupabaseMatchToMatch);
};

// Get a single match by ID
export const getMatch = async (id: string): Promise<Match | undefined> => {
  // Get the current team ID from localStorage
  const currentTeamId = localStorage.getItem("currentTeamId");

  // If no team is selected, there is nothing to find
  if (!currentTeamId) {
    console.log("No team selected, cannot fetch match");
    return undefined;
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .eq("team_id", currentTeamId) // Critical: Ensure this match belongs to current team
    .maybeSingle();

  if (error) {
    console.error("Error fetching match:", error);
    return undefined;
  }

  return data ? mapSupabaseMatchToMatch(data) : undefined;
};
