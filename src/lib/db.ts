
// This file re-exports all database functions to maintain backwards compatibility
import { getPlayers, getPlayer, addPlayer, updatePlayer, deletePlayer, updatePlayerStats } from "./player-service";
import { getMatches, getMatch, addMatch, updateMatch, deleteMatch } from "./match-service";

export {
  // Player functions
  getPlayers,
  getPlayer,
  addPlayer,
  updatePlayer,
  deletePlayer,
  
  // Match functions
  getMatches,
  getMatch,
  addMatch,
  updateMatch,
  deleteMatch,
  
  // Utility functions
  updatePlayerStats
};
