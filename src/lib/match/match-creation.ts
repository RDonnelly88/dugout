
import { Match } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { mapMatchToSupabase, mapSupabaseMatchToMatch } from "../supabase-utils";
import { getMatches } from "./match-retrieval";

// Add a new match
export const addMatch = async (match: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match> => {
  const now = new Date().toISOString();
  
  const supabaseMatch = {
    ...mapMatchToSupabase(match),
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
        ...match,
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
      ...match,
      createdAt: now,
      updatedAt: now
    };
    matches.push(matchWithId);
    localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
    return matchWithId;
  }
};
