
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch } from "../supabase-utils";
import { getMatches } from "./match-retrieval";
import { updatePlayerStats } from "../player-service";

// Update an existing match
export const updateMatch = async (id: string, updates: Partial<Omit<Match, "id" | "createdAt" | "updatedAt">>): Promise<Match | undefined> => {
  const now = new Date().toISOString();
  
  // Format updates for Supabase (snake_case)
  const formattedUpdates: any = {
    updated_at: now
  };
  
  if (updates.date) formattedUpdates.date = updates.date;
  if (updates.location) formattedUpdates.location = updates.location;
  if (updates.status) formattedUpdates.status = updates.status;
  if (updates.teamA) formattedUpdates.team_a = updates.teamA as any;
  if (updates.teamB) formattedUpdates.team_b = updates.teamB as any;
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating match in Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const index = matches.findIndex(match => match.id === id);
      
      if (index !== -1) {
        matches[index] = {
          ...matches[index],
          ...updates,
          updatedAt: now
        };
        localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
        
        // If the match was completed and scores were updated, update player stats
        if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
          await updatePlayerStats(matches[index]);
        }
        
        return matches[index];
      }
      
      return undefined;
    }
    
    // Map data to ensure it matches the Match type
    const updatedMatch = mapSupabaseMatchToMatch(data);
    
    // If the match was completed and scores were updated, update player stats
    if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
      await updatePlayerStats(updatedMatch);
    }
    
    return updatedMatch;
  } catch (error) {
    console.error("Error updating match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const index = matches.findIndex(match => match.id === id);
    
    if (index !== -1) {
      matches[index] = {
        ...matches[index],
        ...updates,
        updatedAt: now
      };
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      
      // If the match was completed and scores were updated, update player stats
      if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
        await updatePlayerStats(matches[index]);
      }
      
      return matches[index];
    }
    
    return undefined;
  }
};
