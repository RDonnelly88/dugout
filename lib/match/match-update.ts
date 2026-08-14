
import { Match } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabaseMatchToMatch } from "../supabase-utils";
import { getMatches } from "./match-retrieval";
import { updatePlayerStats, revertPlayerStats } from "../player-service";

// Update an existing match
export const updateMatch = async (id: string, updates: Partial<Omit<Match, "id" | "createdAt" | "updatedAt">>): Promise<Match | undefined> => {
  const now = new Date().toISOString();
  
  // Check if we need to revert stats from previous match state before applying updates
  let originalMatch: Match | undefined;
  if (updates.status || updates.teamA?.score !== undefined || updates.teamB?.score !== undefined) {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select()
        .eq("id", id)
        .single();
      
      if (!error && data) {
        originalMatch = mapSupabaseMatchToMatch(data);
        
        // If the original match was completed, we need to revert player stats
        if (originalMatch.status === "completed") {
          await revertPlayerStats(originalMatch);
        }
      }
    } catch (error) {
      console.error("Error fetching original match:", error);
    }
  }
  
  // Format updates for Supabase (snake_case)
  const formattedUpdates: any = {
    updated_at: now
  };
  
  if (updates.date) formattedUpdates.date = updates.date;
  if (updates.location) formattedUpdates.location = updates.location;
  if (updates.status) formattedUpdates.status = updates.status;
  if (updates.teamA) formattedUpdates.team_a = updates.teamA as any;
  if (updates.teamB) formattedUpdates.team_b = updates.teamB as any;
  if (updates.seasonId !== undefined) formattedUpdates.season_id = updates.seasonId;
  
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
        // Save original match for stats reversion if needed
        const originalLocalMatch = matches[index];
        
        // Apply updates
        matches[index] = {
          ...matches[index],
          ...updates,
          updatedAt: now
        };
        localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
        
        // If the match was completed and scores were updated, update player stats
        if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
          // If the original match was completed, revert its stats first
          if (originalLocalMatch.status === "completed") {
            await revertPlayerStats(originalLocalMatch);
          }
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
      // Save original match for stats reversion if needed
      const originalLocalMatch = matches[index];
      
      // Apply updates
      matches[index] = {
        ...matches[index],
        ...updates,
        updatedAt: now
      };
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      
      // If the match was completed and scores were updated, update player stats
      if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
        // If the original match was completed, revert its stats first
        if (originalLocalMatch.status === "completed") {
          await revertPlayerStats(originalLocalMatch);
        }
        await updatePlayerStats(matches[index]);
      }
      
      return matches[index];
    }
    
    return undefined;
  }
};
