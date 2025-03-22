
import { Player, Match, PlayerStats } from "@/types";
import { v4 as uuidv4 } from "@/lib/uuid";

// Local storage keys
const PLAYERS_KEY = "football-tracker-players";
const MATCHES_KEY = "football-tracker-matches";

// Get players from local storage
export const getPlayers = (): Player[] => {
  const players = localStorage.getItem(PLAYERS_KEY);
  return players ? JSON.parse(players) : [];
};

// Get a single player by ID
export const getPlayer = (id: string): Player | undefined => {
  const players = getPlayers();
  return players.find(player => player.id === id);
};

// Save players to local storage
export const savePlayers = (players: Player[]) => {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

// Add a new player
export const addPlayer = (player: Omit<Player, "id" | "stats" | "createdAt" | "updatedAt">): Player => {
  const players = getPlayers();
  const now = new Date().toISOString();
  
  const newPlayer: Player = {
    id: uuidv4(),
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
  
  players.push(newPlayer);
  savePlayers(players);
  return newPlayer;
};

// Update an existing player
export const updatePlayer = (id: string, updates: Partial<Omit<Player, "id" | "createdAt" | "updatedAt">>): Player | undefined => {
  const players = getPlayers();
  const index = players.findIndex(player => player.id === id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    players[index] = {
      ...players[index],
      ...updates,
      updatedAt: now
    };
    savePlayers(players);
    return players[index];
  }
  
  return undefined;
};

// Delete a player
export const deletePlayer = (id: string): boolean => {
  const players = getPlayers();
  const filteredPlayers = players.filter(player => player.id !== id);
  
  if (filteredPlayers.length !== players.length) {
    savePlayers(filteredPlayers);
    return true;
  }
  
  return false;
};

// Get matches from local storage
export const getMatches = (): Match[] => {
  const matches = localStorage.getItem(MATCHES_KEY);
  return matches ? JSON.parse(matches) : [];
};

// Get a single match by ID
export const getMatch = (id: string): Match | undefined => {
  const matches = getMatches();
  return matches.find(match => match.id === id);
};

// Save matches to local storage
export const saveMatches = (matches: Match[]) => {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
};

// Add a new match
export const addMatch = (match: Omit<Match, "id" | "createdAt" | "updatedAt">): Match => {
  const matches = getMatches();
  const now = new Date().toISOString();
  
  const newMatch: Match = {
    id: uuidv4(),
    ...match,
    createdAt: now,
    updatedAt: now
  };
  
  matches.push(newMatch);
  saveMatches(matches);
  return newMatch;
};

// Update an existing match
export const updateMatch = (id: string, updates: Partial<Omit<Match, "id" | "createdAt" | "updatedAt">>): Match | undefined => {
  const matches = getMatches();
  const index = matches.findIndex(match => match.id === id);
  
  if (index !== -1) {
    const now = new Date().toISOString();
    matches[index] = {
      ...matches[index],
      ...updates,
      updatedAt: now
    };
    saveMatches(matches);
    
    // If the match was completed and scores were updated, update player stats
    if (updates.status === "completed" && (updates.teamA?.score !== undefined || updates.teamB?.score !== undefined)) {
      updatePlayerStats(matches[index]);
    }
    
    return matches[index];
  }
  
  return undefined;
};

// Delete a match
export const deleteMatch = (id: string): boolean => {
  const matches = getMatches();
  const filteredMatches = matches.filter(match => match.id !== id);
  
  if (filteredMatches.length !== matches.length) {
    saveMatches(filteredMatches);
    return true;
  }
  
  return false;
};

// Update player stats based on match results
export const updatePlayerStats = (match: Match) => {
  if (match.status !== "completed" || match.teamA.score === undefined || match.teamB.score === undefined) {
    return;
  }
  
  const players = getPlayers();
  const updatedPlayers = [...players];
  const teamAWon = match.teamA.score > match.teamB.score;
  const teamBWon = match.teamB.score > match.teamA.score;
  const isDraw = match.teamA.score === match.teamB.score;
  
  // Update Team A players
  match.teamA.players.forEach(playerId => {
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
      
      updatedPlayers[playerIndex] = {
        ...player,
        stats,
        updatedAt: new Date().toISOString()
      };
    }
  });
  
  // Update Team B players
  match.teamB.players.forEach(playerId => {
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
      
      updatedPlayers[playerIndex] = {
        ...player,
        stats,
        updatedAt: new Date().toISOString()
      };
    }
  });
  
  savePlayers(updatedPlayers);
};
