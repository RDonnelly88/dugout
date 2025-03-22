
import { Season, SeasonPlayerStats, SeasonChampion, PlayerForm, PlayerFormResult } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToSeason } from "../supabase-utils";

// Get all seasons
export const getSeasons = async (): Promise<Season[]> => {
  try {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .order("start_date", { ascending: false });
    
    if (error) {
      console.error("Error fetching seasons:", error);
      return [];
    }
    
    // Map data to ensure it matches the Season type
    return (data || []).map(mapSupabaseToSeason);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
};

// Get a single season by ID
export const getSeason = async (id: string): Promise<Season | undefined> => {
  try {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching season:", error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map data to ensure it matches the Season type
    return mapSupabaseToSeason(data);
  } catch (error) {
    console.error("Error fetching season:", error);
    return undefined;
  }
};

// Get the current season
export const getCurrentSeason = async (): Promise<Season | undefined> => {
  try {
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("is_current", true)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching current season:", error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map data to ensure it matches the Season type
    return mapSupabaseToSeason(data);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return undefined;
  }
};

// Get player stats for a season
export const getSeasonPlayerStats = async (seasonId: string): Promise<SeasonPlayerStats[]> => {
  try {
    const { data, error } = await supabase
      .from("season_player_stats")
      .select("*")
      .eq("season_id", seasonId)
      .order("points", { ascending: false });
    
    if (error) {
      console.error("Error fetching season player stats:", error);
      return [];
    }
    
    // Map data to our frontend types
    return (data || []).map(item => ({
      seasonId: item.season_id,
      seasonName: item.season_name,
      playerId: item.player_id,
      playerName: item.player_name,
      playerImage: item.player_image,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
      played: item.played,
      points: item.points
    }));
  } catch (error) {
    console.error("Error fetching season player stats:", error);
    return [];
  }
};

// Get champions (top players) for a season
export const getSeasonChampions = async (seasonId?: string): Promise<SeasonChampion[]> => {
  try {
    let query = supabase
      .from("season_champions")
      .select("*")
      .order("season_name", { ascending: false })
      .order("rank", { ascending: true });
    
    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching season champions:", error);
      return [];
    }
    
    // Map data to our frontend types
    return (data || []).map(item => ({
      seasonId: item.season_id,
      seasonName: item.season_name,
      playerId: item.player_id,
      playerName: item.player_name,
      playerImage: item.player_image,
      points: item.points,
      wins: item.wins,
      draws: item.draws,
      losses: item.losses,
      played: item.played,
      rank: item.rank
    }));
  } catch (error) {
    console.error("Error fetching season champions:", error);
    return [];
  }
};

// Get player form for a season
export const getPlayerFormInSeason = async (seasonId: string, playerId: string): Promise<PlayerFormResult[]> => {
  try {
    const { data, error } = await supabase
      .from("player_match_results")
      .select("*")
      .eq("season_id", seasonId)
      .eq("player_id", playerId)
      .order("date", { ascending: false })
      .limit(5);
    
    if (error) {
      console.error("Error fetching player form:", error);
      return [];
    }
    
    // Return the results as an array of win/loss/draw
    return (data || []).map(item => item.result as PlayerFormResult);
  } catch (error) {
    console.error("Error fetching player form:", error);
    return [];
  }
};
