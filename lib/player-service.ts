
import { Player } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapSupabasePlayerToPlayer, mapPlayerToSupabase } from "./supabase-utils";

// Get all players from Supabase
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching players:", error);
      return [];
    }
    
    // Map data to ensure it matches the Player type
    return (data || []).map(mapSupabasePlayerToPlayer);
  } catch (error) {
    console.error("Error fetching players:", error);
    // Fallback to localStorage
    const players = localStorage.getItem("football-tracker-players");
    return players ? JSON.parse(players) : [];
  }
};

// Get a single player by ID
export const getPlayer = async (id: string): Promise<Player | undefined> => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching player:", error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map data to ensure it matches the Player type
    return mapSupabasePlayerToPlayer(data);
  } catch (error) {
    console.error("Error fetching player:", error);
    // Fallback to localStorage
    const players = localStorage.getItem("football-tracker-players");
    const parsedPlayers = players ? JSON.parse(players) : [];
    return parsedPlayers.find((player: Player) => player.id === id);
  }
};

// Add a new player
export const addPlayer = async (player: Omit<Player, "id" | "createdAt" | "updatedAt">): Promise<Player> => {
  const now = new Date().toISOString();
  
  // Convert to the format expected by Supabase
  const supabasePlayer = mapPlayerToSupabase(player);
  
  try {
    console.log("Adding player with data:", supabasePlayer);
    const { data, error } = await supabase
      .from("players")
      .insert({
        ...supabasePlayer,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding player to Supabase:", error);
      // Fallback to localStorage
      const players = await getPlayers();
      const playerWithId = {
        id: crypto.randomUUID(),
        ...player,
        createdAt: now,
        updatedAt: now
      };
      players.push(playerWithId);
      localStorage.setItem("football-tracker-players", JSON.stringify(players));
      return playerWithId;
    }
    
    console.log("Player added successfully:", data);
    // Map data to ensure it matches the Player type
    return mapSupabasePlayerToPlayer(data);
  } catch (error) {
    console.error("Error adding player:", error);
    // Fallback to localStorage
    const players = await getPlayers();
    const playerWithId = {
      id: crypto.randomUUID(),
      ...player,
      createdAt: now,
      updatedAt: now
    };
    players.push(playerWithId);
    localStorage.setItem("football-tracker-players", JSON.stringify(players));
    return playerWithId;
  }
};

// Update an existing player
export const updatePlayer = async (id: string, updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">>): Promise<Player | undefined> => {
  const now = new Date().toISOString();
  
  // Format updates for Supabase
  const formattedUpdates: any = {
    updated_at: now
  };
  
  if (updates.name) formattedUpdates.name = updates.name;
  if (updates.image !== undefined) formattedUpdates.image = updates.image;
  if (updates.imageUrl !== undefined) formattedUpdates.image = updates.imageUrl;
  if (updates.isActive !== undefined) formattedUpdates.is_active = updates.isActive;
  
  try {
    const { data, error } = await supabase
      .from("players")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating player in Supabase:", error);
      // Fallback to localStorage
      const players = await getPlayers();
      const index = players.findIndex(player => player.id === id);
      
      if (index !== -1) {
        players[index] = {
          ...players[index],
          ...updates,
          updatedAt: now
        };
        localStorage.setItem("football-tracker-players", JSON.stringify(players));
        return players[index];
      }
      
      return undefined;
    }
    
    // Map data to ensure it matches the Player type
    return mapSupabasePlayerToPlayer(data);
  } catch (error) {
    console.error("Error updating player:", error);
    // Fallback to localStorage
    const players = await getPlayers();
    const index = players.findIndex(player => player.id === id);
    
    if (index !== -1) {
      players[index] = {
        ...players[index],
        ...updates,
        updatedAt: now
      };
      localStorage.setItem("football-tracker-players", JSON.stringify(players));
      return players[index];
    }
    
    return undefined;
  }
};

// Delete a player
export const deletePlayer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting player from Supabase:", error);
      // Fallback to localStorage
      const players = await getPlayers();
      const filteredPlayers = players.filter(player => player.id !== id);
      
      if (filteredPlayers.length !== players.length) {
        localStorage.setItem("football-tracker-players", JSON.stringify(filteredPlayers));
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting player:", error);
    // Fallback to localStorage
    const players = await getPlayers();
    const filteredPlayers = players.filter(player => player.id !== id);
    
    if (filteredPlayers.length !== players.length) {
      localStorage.setItem("football-tracker-players", JSON.stringify(filteredPlayers));
      return true;
    }
    
    return false;
  }
};
