
import { Season } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSeasonToSupabase, mapSupabaseToSeason } from "../supabase-utils";

// Add a new season
export const addSeason = async (season: Omit<Season, "id" | "createdAt" | "updatedAt">): Promise<Season> => {
  const now = new Date().toISOString();
  
  // Convert to the format expected by Supabase
  const supabaseSeason = mapSeasonToSupabase(season);
  
  try {
    const { data, error } = await supabase
      .from("seasons")
      .insert({
        ...supabaseSeason,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding season to Supabase:", error);
      throw error;
    }
    
    // Map data to ensure it matches the Season type
    return mapSupabaseToSeason(data);
  } catch (error) {
    console.error("Error adding season:", error);
    throw error;
  }
};

// Update an existing season
export const updateSeason = async (id: string, updates: Partial<Omit<Season, "id" | "createdAt" | "updatedAt">>): Promise<Season | undefined> => {
  const now = new Date().toISOString();
  
  // Format updates for Supabase
  const formattedUpdates: any = {
    updated_at: now
  };
  
  if (updates.name !== undefined) formattedUpdates.name = updates.name;
  if (updates.startDate !== undefined) formattedUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) formattedUpdates.end_date = updates.endDate;
  if (updates.isCurrent !== undefined) formattedUpdates.is_current = updates.isCurrent;
  
  try {
    const { data, error } = await supabase
      .from("seasons")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating season in Supabase:", error);
      throw error;
    }
    
    // Map data to ensure it matches the Season type
    return mapSupabaseToSeason(data);
  } catch (error) {
    console.error("Error updating season:", error);
    throw error;
  }
};

// Delete a season
export const deleteSeason = async (id: string): Promise<boolean> => {
  try {
    // First update any matches in this season to have null season_id
    const { error: matchUpdateError } = await supabase
      .from("matches")
      .update({ season_id: null })
      .eq("season_id", id);
    
    if (matchUpdateError) {
      console.error("Error updating matches for season deletion:", matchUpdateError);
    }
    
    // Now delete the season
    const { error } = await supabase
      .from("seasons")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting season from Supabase:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting season:", error);
    return false;
  }
};
