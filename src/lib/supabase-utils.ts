import { Json } from "@/integrations/supabase/types";
import { Player, Match, PlayerStats, TeamInfo, MatchStatus, Season } from "@/types";

// Helper function to map Supabase player response to our Player type
export const mapSupabasePlayerToPlayer = (data: any): Player => {
  if (!data) return data;
  
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    stats: data.stats as PlayerStats,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    team_id: data.team_id,
    imageUrl: data.image
  };
};

// Helper function to map our Player type to Supabase format
export const mapPlayerToSupabase = (player: Omit<Player, "id" | "createdAt" | "updatedAt">): any => {
  return {
    name: player.name,
    image: player.image || player.imageUrl,
    stats: player.stats as unknown as Json,
    team_id: player.team_id
  };
};

// Helper function to map Supabase match response to our Match type
export const mapSupabaseMatchToMatch = (data: any): Match => {
  if (!data) return data;
  
  return {
    id: data.id,
    date: data.date,
    location: data.location,
    teamA: data.team_a as unknown as TeamInfo,
    teamB: data.team_b as unknown as TeamInfo,
    status: data.status as MatchStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    seasonId: data.season_id
  };
};

// Helper function to map our Match type to Supabase format
export const mapMatchToSupabase = (match: Omit<Match, "id" | "createdAt" | "updatedAt">): any => {
  return {
    date: match.date,
    location: match.location,
    team_a: match.teamA as unknown as Json,
    team_b: match.teamB as unknown as Json,
    status: match.status,
    season_id: match.seasonId
  };
};

// Helper function to map Supabase season response to our Season type
export const mapSupabaseToSeason = (data: any): Season => {
  if (!data) return data;
  
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    isCurrent: data.is_current,
    isFinished: data.is_finished || false,
    teamId: data.team_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Helper function to map our Season type to Supabase format
export const mapSeasonToSupabase = (season: any) => {
  return {
    name: season.name,
    start_date: season.startDate,
    end_date: season.endDate,
    is_current: season.isCurrent,
    is_finished: season.isFinished || false,
    team_id: season.teamId
  };
};
