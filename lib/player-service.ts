import { Player } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabasePlayerToPlayer, mapPlayerToSupabase } from "./supabase-utils";
import type { Database } from "@/lib/database.types";

/** Typed against the schema, so a column renamed in a migration fails here. */
type PlayerUpdate = Database["public"]["Tables"]["players"]["Update"];

/**
 * Reading and writing players.
 *
 * Every one of these used to fall back to a copy of the squad in
 * `localStorage` when the request failed — so adding a player while offline
 * reported success, wrote them nowhere the database could see, and left a
 * stale squad behind that the next `getPlayers` would serve as if it were
 * real. A write that did not happen has to say so.
 */

/**
 * The current team's squad.
 *
 * Scoped here rather than by each caller, the way `getMatches` and
 * `getPlayerRecords` already are. It used to select every player the database
 * would hand over — which is every team you belong to — while every caller
 * cached it under a team-scoped query key. Only the players page happened to
 * filter afterwards, so compare, ratings, export and match creation all showed
 * other teams' players, and switching team served the previous squad from cache
 * under the new team's key.
 */
export const getPlayers = async (): Promise<Player[]> => {
  const currentTeamId = localStorage.getItem("currentTeamId");
  if (!currentTeamId) return [];

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", currentTeamId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }

  return (data ?? []).map(mapSupabasePlayerToPlayer);
};

export const getPlayer = async (id: string): Promise<Player | undefined> => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching player:", error);
    return undefined;
  }

  return data ? mapSupabasePlayerToPlayer(data) : undefined;
};

export const addPlayer = async (
  player: Omit<Player, "id" | "createdAt" | "updatedAt">
): Promise<Player> => {
  const { data, error } = await supabase
    .from("players")
    .insert(mapPlayerToSupabase(player))
    .select()
    .single();

  // Thrown rather than swallowed: the caller is a mutation whose error branch
  // tells the user it did not save.
  if (error) throw error;

  return mapSupabasePlayerToPlayer(data);
};

export const updatePlayer = async (
  id: string,
  updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">>
): Promise<Player | undefined> => {
  const formatted: PlayerUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name) formatted.name = updates.name;
  if (updates.image !== undefined) formatted.image = updates.image;
  if (updates.imageUrl !== undefined) formatted.image = updates.imageUrl;
  if (updates.isActive !== undefined) formatted.is_active = updates.isActive;
  if (updates.skillLevel !== undefined) formatted.skill_level = updates.skillLevel;

  const { data, error } = await supabase
    .from("players")
    .update(formatted)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapSupabasePlayerToPlayer(data);
};

export const deletePlayer = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) throw error;

  return true;
};
