
import { Player, Match, PlayerStats } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";

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
    
    return data as Player[];
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
    
    return data as Player;
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
  
  try {
    const { data, error } = await supabase
      .from("players")
      .insert(newPlayer)
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
    
    return data as Player;
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
  
  try {
    const { data, error } = await supabase
      .from("players")
      .update({ ...updates, updated_at: now })
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
    
    return data as Player;
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

// Get matches from Supabase
export const getMatches = async (): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
    
    // Map data to ensure it matches the Match type
    return data.map((match: any) => ({
      id: match.id,
      date: match.date,
      location: match.location,
      teamA: match.team_a,
      teamB: match.team_b,
      status: match.status,
      createdAt: match.created_at,
      updatedAt: match.updated_at
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
    // Fallback to localStorage
    const matches = localStorage.getItem("football-tracker-matches");
    return matches ? JSON.parse(matches) : [];
  }
};

// Get a single match by ID
export const getMatch = async (id: string): Promise<Match | undefined> => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching match:", error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Map data to ensure it matches the Match type
    return {
      id: data.id,
      date: data.date,
      location: data.location,
      teamA: data.team_a,
      teamB: data.team_b,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching match:", error);
    // Fallback to localStorage
    const matches = localStorage.getItem("football-tracker-matches");
    const parsedMatches = matches ? JSON.parse(matches) : [];
    return parsedMatches.find((match: Match) => match.id === id);
  }
};

// Add a new match
export const addMatch = async (match: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match> => {
  const now = new Date().toISOString();
  
  const newMatch = {
    date: match.date,
    location: match.location,
    team_a: match.teamA,
    team_b: match.teamB,
    status: match.status,
    created_at: now,
    updated_at: now
  };
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .insert(newMatch)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding match to Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const matchWithId = {
        id: uuidv4(),
        teamA: match.teamA,
        teamB: match.teamB,
        date: match.date,
        location: match.location,
        status: match.status,
        createdAt: now,
        updatedAt: now
      };
      matches.push(matchWithId);
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      return matchWithId;
    }
    
    // Map data to ensure it matches the Match type
    return {
      id: data.id,
      date: data.date,
      location: data.location,
      teamA: data.team_a,
      teamB: data.team_b,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error adding match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const matchWithId = {
      id: uuidv4(),
      teamA: match.teamA,
      teamB: match.teamB,
      date: match.date,
      location: match.location,
      status: match.status,
      createdAt: now,
      updatedAt: now
    };
    matches.push(matchWithId);
    localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
    return matchWithId;
  }
};

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
  if (updates.teamA) formattedUpdates.team_a = updates.teamA;
  if (updates.teamB) formattedUpdates.team_b = updates.teamB;
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .update(formattedUpdates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating match in Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const index = matches.findIndex(match => match.id === id);
      
      if (index !== -1) {
        matches[index] = {
          ...matches[index],
          ...updates,
          updatedAt: now
        };
        localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
        
        // If the match was completed and scores were updated, update player stats
        if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
          await updatePlayerStats(matches[index]);
        }
        
        return matches[index];
      }
      
      return undefined;
    }
    
    // Map data to ensure it matches the Match type
    const updatedMatch = {
      id: data.id,
      date: data.date,
      location: data.location,
      teamA: data.team_a,
      teamB: data.team_b,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    // If the match was completed and scores were updated, update player stats
    if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
      await updatePlayerStats(updatedMatch);
    }
    
    return updatedMatch;
  } catch (error) {
    console.error("Error updating match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const index = matches.findIndex(match => match.id === id);
    
    if (index !== -1) {
      matches[index] = {
        ...matches[index],
        ...updates,
        updatedAt: now
      };
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      
      // If the match was completed and scores were updated, update player stats
      if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
        await updatePlayerStats(matches[index]);
      }
      
      return matches[index];
    }
    
    return undefined;
  }
};

// Delete a match
export const deleteMatch = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting match from Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const filteredMatches = matches.filter(match => match.id !== id);
      
      if (filteredMatches.length !== matches.length) {
        localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const filteredMatches = matches.filter(match => match.id !== id);
    
    if (filteredMatches.length !== matches.length) {
      localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
      return true;
    }
    
    return false;
  }
};

// Update player stats based on match results
export const updatePlayerStats = async (match: Match): Promise<void> => {
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
            stats: stats,
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
            stats: stats,
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
