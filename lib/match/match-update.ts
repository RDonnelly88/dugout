import { Match } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabaseMatchToMatch } from "../supabase-utils";

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
  if (updates.seasonId !== undefined) formattedUpdates.season_id = updates.seasonId;

  const { data, error } = await supabase
    .from("matches")
    .update(formattedUpdates)
    .eq("id", id)
    .select()
    .single();

  // As with creating one: a write the database refused has not happened, and
  // saying otherwise leaves the screen showing a result nobody else can see.
  if (error) throw error;

  return mapSupabaseMatchToMatch(data);
};
