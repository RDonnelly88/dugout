
import { Season, SeasonPlayerStats, SeasonChampion, PlayerForm, PlayerFormResult } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabaseToSeason } from "../supabase-utils";

// Get all seasons
export const getSeasons = async (): Promise<Season[]> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return empty array
    if (!currentTeamId) {
      console.log("No team selected, returning empty seasons array");
      return [];
    }
    
    console.log("Fetching seasons for team:", currentTeamId);
    
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("team_id", currentTeamId)
      .order("start_date", { ascending: false });
    
    if (error) {
      console.error("Error fetching seasons:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No seasons found for team:", currentTeamId);
    } else {
      console.log(`Found ${data.length} seasons for team ${currentTeamId}`);
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
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return undefined
    if (!currentTeamId) {
      console.log("No team selected, cannot fetch season");
      return undefined;
    }
    
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("id", id)
      .eq("team_id", currentTeamId)  // Enforce team check
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching season:", error);
      return undefined;
    }
    
    if (!data) {
      console.log(`Season ${id} not found for team ${currentTeamId}`);
      return undefined;
    }
    
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
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return undefined
    if (!currentTeamId) {
      console.log("No team selected, cannot fetch current season");
      return undefined;
    }
    
    // First try to get current season by is_current flag
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("is_current", true)
      .eq("team_id", currentTeamId)  // Critical: Only get current season for this team
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching current season:", error);
      return undefined;
    }
    
    // If we found a current season, return it
    if (data) {
      return mapSupabaseToSeason(data);
    }
    
    // If no season is marked as current, get the most recent one
    console.log("No current season found for team:", currentTeamId);
    
    // Fall back to most recent season for this team
    const { data: recentData, error: recentError } = await supabase
      .from("seasons")
      .select("*")
      .eq("team_id", currentTeamId)  // Critical: Only for this team
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (recentError) {
      console.error("Error fetching recent season:", recentError);
      return undefined;
    }
    
    if (!recentData) {
      console.log("No seasons found for team:", currentTeamId);
      return undefined;
    }
    
    // Map data to ensure it matches the Season type
    return mapSupabaseToSeason(recentData);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return undefined;
  }
};

// Get player stats for a season
export const getSeasonPlayerStats = async (seasonId: string): Promise<SeasonPlayerStats[]> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return empty array
    if (!currentTeamId) {
      console.log("No team selected, returning empty season player stats");
      return [];
    }
    
    // First, verify this season belongs to the current team
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("team_id")
      .eq("id", seasonId)
      .eq("team_id", currentTeamId)  // Critical security check
      .maybeSingle();
    
    if (seasonError || !seasonData) {
      console.error("Error verifying season or season not found:", seasonError);
      return [];
    }
    
    // If season doesn't belong to current team, return empty array
    if (seasonData.team_id !== currentTeamId) {
      console.log("Season doesn't belong to current team");
      return [];
    }
    
    const { data, error } = await supabase
      .from("season_player_stats")
      .select("*")
      .eq("season_id", seasonId)
      .order("points", { ascending: false });
    
    if (error) {
      console.error("Error fetching season player stats:", error);
      return [];
    }
    
    // Every column on the view is nullable — Postgres can't prove a join
    // produced a row, so the generated types say so even where the data never
    // is. A stats row with no player or season isn't a stats row; drop it
    // rather than invent an identifier. Tallies fall back to zero.
    return (data || []).flatMap((item) =>
      item.season_id && item.player_id
        ? [
            {
              seasonId: item.season_id,
              seasonName: item.season_name ?? "",
              playerId: item.player_id,
              playerName: item.player_name ?? "",
              playerImage: item.player_image,
              wins: item.wins ?? 0,
              losses: item.losses ?? 0,
              draws: item.draws ?? 0,
              played: item.played ?? 0,
              points: item.points ?? 0,
            },
          ]
        : []
    );
  } catch (error) {
    console.error("Error fetching season player stats:", error);
    return [];
  }
};

// Get champions (top players) for a season
export const getSeasonChampions = async (seasonId?: string): Promise<SeasonChampion[]> => {
  try {
    // Get the current team ID from localStorage
    const currentTeamId = localStorage.getItem("currentTeamId");
    
    // If no team is selected, return empty array
    if (!currentTeamId) {
      console.log("No team selected, returning empty season champions");
      return [];
    }
    
    // Get seasons for the current team to filter champions
    const { data: teamSeasons, error: seasonsError } = await supabase
      .from("seasons")
      .select("id")
      .eq("team_id", currentTeamId);
    
    if (seasonsError) {
      console.error("Error fetching team seasons:", seasonsError);
      return [];
    }
    
    const teamSeasonIds = (teamSeasons || []).map(season => season.id);
    
    if (teamSeasonIds.length === 0) {
      // If no seasons exist for this team, return empty array
      console.log("No seasons found for current team");
      return [];
    }
    
    let query = supabase
      .from("season_champions")
      .select("*")
      .in("season_id", teamSeasonIds)  // Critical: Only include seasons for this team
      .order("season_name", { ascending: false })
      .order("rank", { ascending: true });
    
    // Filter by season ID if provided
    if (seasonId) {
      // Make sure the season belongs to current team
      if (!teamSeasonIds.includes(seasonId)) {
        console.log("Requested season doesn't belong to current team");
        return [];
      }
      query = query.eq("season_id", seasonId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching season champions:", error);
      return [];
    }
    
    // Same nullable-view caveat as getSeasonPlayerStats above.
    return (data || []).flatMap((item) =>
      item.season_id && item.player_id
        ? [
            {
              seasonId: item.season_id,
              seasonName: item.season_name ?? "",
              playerId: item.player_id,
              playerName: item.player_name ?? "",
              playerImage: item.player_image,
              points: item.points ?? 0,
              wins: item.wins ?? 0,
              draws: item.draws ?? 0,
              losses: item.losses ?? 0,
              played: item.played ?? 0,
              rank: item.rank ?? 0,
            },
          ]
        : []
    );
  } catch (error) {
    console.error("Error fetching season champions:", error);
    return [];
  }
};
