
import { Match } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseMatchToMatch, mapMatchToSupabase } from "./supabase-utils";
import { updatePlayerStats } from "./player-service";

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

// Delete a match
export const deleteMatch = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting match from Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const filteredMatches = matches.filter(match => match.id !== id);
      
      if (filteredMatches.length !== matches.length) {
        localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const filteredMatches = matches.filter(match => match.id !== id);
    
    if (filteredMatches.length !== matches.length) {
      localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
      return true;
    }
    
    return false;
  }
};
