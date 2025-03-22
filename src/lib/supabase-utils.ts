
import { Json } from "@/integrations/supabase/types";
import { Player, Match, PlayerStats, TeamInfo, MatchStatus } from "@/types";

// Helper function to map Supabase player response to our Player type
export const mapSupabasePlayerToPlayer = (data: any): Player => {
  if (!data) return data;
  
  return {
    id: data.id,
    name: data.name,
    image: data.image,
    stats: data.stats as PlayerStats,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Helper function to map our Player type to Supabase format
export const mapPlayerToSupabase = (player: Omit<Player, "id" | "createdAt" | "updatedAt">): any => {
  return {
    name: player.name,
    image: player.image,
    stats: player.stats as unknown as Json
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
    updatedAt: data.updated_at
  };
};

// Helper function to map our Match type to Supabase format
export const mapMatchToSupabase = (match: Omit<Match, "id" | "createdAt" | "updatedAt">): any => {
  return {
    date: match.date,
    location: match.location,
    team_a: match.teamA as unknown as Json,
    team_b: match.teamB as unknown as Json,
    status: match.status
  };
};
