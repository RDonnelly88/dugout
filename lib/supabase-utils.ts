
import { Json } from "@/lib/database.types";
import { Match, MatchStatus, Player, Season, TeamInfo } from "@/types";
import { SKILL } from "@/lib/config";

// Helper function to map Supabase player response to our Player type
export const mapSupabasePlayerToPlayer = (data: any): Player => {
  if (!data) return data;

  return {
    id: data.id,
    name: data.name,
    image: data.image,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    teamId: data.team_id,
    imageUrl: data.image,
    isActive: data.is_active,
    skillLevel: data.skill_level ?? SKILL.default
  };
};

// Helper function to map our Player type to Supabase format
export const mapPlayerToSupabase = (player: Omit<Player, "id" | "createdAt" | "updatedAt">): any => {
  return {
    name: player.name,
    image: player.image || player.imageUrl,
    team_id: player.teamId,
    is_active: player.isActive,
    skill_level: player.skillLevel ?? SKILL.default
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
    outcome: data.outcome ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    seasonId: data.season_id,
    teamId: data.team_id
  };
};

/**
 * The columns an edit writes, from the fields it was handed.
 *
 * Only what the caller actually passed, so editing a date does not blank a
 * score. A field missing from here fails quietly in the worst way: the write
 * succeeds, having saved everything except the thing that changed.
 *
 * `outcome`, `seasonId` and `notes` are checked against undefined rather than
 * for truth, because clearing any of them is itself an edit — and an outcome
 * is null for a match with no result, which is a value, not an absence.
 */
export const mapMatchUpdateToSupabase = (
  updates: Partial<Omit<Match, "id" | "createdAt" | "updatedAt">>
): Record<string, unknown> => {
  const columns: Record<string, unknown> = {};

  if (updates.date) columns.date = updates.date;
  if (updates.location) columns.location = updates.location;
  if (updates.status) columns.status = updates.status;
  if (updates.teamA) columns.team_a = updates.teamA;
  if (updates.teamB) columns.team_b = updates.teamB;
  if (updates.outcome !== undefined) columns.outcome = updates.outcome;
  if (updates.seasonId !== undefined) columns.season_id = updates.seasonId;
  if (updates.notes !== undefined) columns.notes = updates.notes;

  return columns;
};

// Helper function to map our Match type to Supabase format
export const mapMatchToSupabase = (match: Omit<Match, "id" | "createdAt" | "updatedAt">): any => {
  return {
    date: match.date,
    location: match.location,
    team_a: match.teamA as unknown as Json,
    team_b: match.teamB as unknown as Json,
    status: match.status,
    outcome: match.outcome ?? null,
    season_id: match.seasonId,
    team_id: match.teamId
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
export const mapSeasonToSupabase = (season: Omit<Season, "id" | "createdAt" | "updatedAt">): any => {
  return {
    name: season.name,
    start_date: season.startDate,
    end_date: season.endDate,
    is_current: season.isCurrent,
    is_finished: season.isFinished || false,
    team_id: season.teamId
  };
};
