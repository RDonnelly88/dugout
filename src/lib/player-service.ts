
import { Player, PlayerStats } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { mapSupabasePlayerToPlayer, mapPlayerToSupabase } from "./supabase-utils";

// Get players from Supabase
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Error fetching players:", error);
      return [];
    }
    
    return (data || []).map(mapSupabasePlayerToPlayer);
  } catch (error) {
    console.error("Error fetching players:", error);
    // Fallback to localStorage if Supabase fails
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
    
    return data ? mapSupabasePlayerToPlayer(data) : undefined;
  } catch (error) {
    console.error("Error fetching player:", error);
    // Fallback to localStorage if Supabase fails
    const players = localStorage.getItem("football-tracker-players");
    const parsedPlayers = players ? JSON.parse(players) : [];
    return parsedPlayers.find((player: Player) => player.id === id);
  }
};

// Add a new player
export const addPlayer = async (player: Omit<Player, "id" | "stats" | "createdAt" | "updatedAt">): Promise<Player> => {
  const now = new Date().toISOString();
  
  const newPlayer: Omit<Player, "id"> = {
    ...player,
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0
    },
    createdAt: now,
    updatedAt: now
  };

  const supabasePlayer = {
    name: player.name,
    image: player.image,
    stats: newPlayer.stats,
    created_at: now,
    updated_at: now
  };
  
  try {
    const { data, error } = await supabase
      .from("players")
      .insert(supabasePlayer)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding player to Supabase:", error);
      // Fallback to localStorage
      const players = await getPlayers();
      const playerWithId = {
        id: uuidv4(),
        ...newPlayer
      };
      players.push(playerWithId);
      localStorage.setItem("football-tracker-players", JSON.stringify(players));
      return playerWithId;
    }
    
    return mapSupabasePlayerToPlayer(data);
  } catch (error) {
    console.error("Error adding player:", error);
    // Fallback to localStorage
    const players = await getPlayers();
    const playerWithId = {
      id: uuidv4(),
      ...newPlayer
    };
    players.push(playerWithId);
    localStorage.setItem("football-tracker-players", JSON.stringify(players));
    return playerWithId;
  }
};

// Update an existing player
export const updatePlayer = async (id: string, updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">>): Promise<Player | undefined> => {
  const now = new Date().toISOString();
  
  const supabaseUpdates: any = { updated_at: now };
  if (updates.name) supabaseUpdates.name = updates.name;
  if (updates.image) supabaseUpdates.image = updates.image;
  if (updates.stats) supabaseUpdates.stats = updates.stats;
  
  try {
    const { data, error } = await supabase
      .from("players")
      .update(supabaseUpdates)
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
        await localStorage.setItem("football-tracker-players", JSON.stringify(players));
        return players[index];
      }
      
      return undefined;
    }
    
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
      await localStorage.setItem("football-tracker-players", JSON.stringify(players));
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
        await localStorage.setItem("football-tracker-players", JSON.stringify(filteredPlayers));
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
      await localStorage.setItem("football-tracker-players", JSON.stringify(filteredPlayers));
      return true;
    }
    
    return false;
  }
};

// Update player stats
export const updatePlayerStats = async (match: any): Promise<void> => {
  if (match.status !== "completed" || match.teamA.score === undefined || match.teamB.score === undefined) {
    return;
  }
  
  const players = await getPlayers();
  const updatedPlayers = [...players];
  const teamAWon = match.teamA.score > match.teamB.score;
  const teamBWon = match.teamB.score > match.teamA.score;
  const isDraw = match.teamA.score === match.teamB.score;
  
  // Update Team A players
  for (const playerId of match.teamA.players) {
    const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = updatedPlayers[playerIndex];
      const stats: PlayerStats = {
        ...player.stats,
        played: player.stats.played + 1
      };
      
      if (teamAWon) stats.won = player.stats.won + 1;
      else if (teamBWon) stats.lost = player.stats.lost + 1;
      else if (isDraw) stats.drawn = player.stats.drawn + 1;
      
      // Update player stats in Supabase
      try {
        await supabase
          .from("players")
          .update({ 
            stats: stats as any,
            updated_at: new Date().toISOString() 
          })
          .eq("id", playerId);
      } catch (error) {
        console.error("Error updating player stats in Supabase:", error);
      }

      updatedPlayers[playerIndex] = {
        ...player,
        stats,
        updatedAt: new Date().toISOString()
      };
    }
  }
  
  // Update Team B players
  for (const playerId of match.teamB.players) {
    const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = updatedPlayers[playerIndex];
      const stats: PlayerStats = {
        ...player.stats,
        played: player.stats.played + 1
      };
      
      if (teamBWon) stats.won = player.stats.won + 1;
      else if (teamAWon) stats.lost = player.stats.lost + 1;
      else if (isDraw) stats.drawn = player.stats.drawn + 1;
      
      // Update player stats in Supabase
      try {
        await supabase
          .from("players")
          .update({ 
            stats: stats as any,
            updated_at: new Date().toISOString() 
          })
          .eq("id", playerId);
      } catch (error) {
        console.error("Error updating player stats in Supabase:", error);
      }

      updatedPlayers[playerIndex] = {
        ...player,
        stats,
        updatedAt: new Date().toISOString()
      };
    }
  }
  
  // Update localStorage as a fallback
  localStorage.setItem("football-tracker-players", JSON.stringify(updatedPlayers));
};
