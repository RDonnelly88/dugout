
// This file re-exports all database functions to maintain backwards compatibility
import { getPlayers, getPlayer, addPlayer, updatePlayer, deletePlayer, updatePlayerStats, revertPlayerStats } from "./player-service";
import { getMatches, getMatch, addMatch, updateMatch, deleteMatch } from "./match-service";
import { 
  getSeasons, 
  getSeason, 
  getCurrentSeason, 
  getSeasonPlayerStats, 
  getSeasonChampions, 
  getPlayerFormInSeason,
  addSeason,
  updateSeason,
  deleteSeason
} from "./season-service";

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
  
  // Season functions
  getSeasons,
  getSeason,
  getCurrentSeason,
  getSeasonPlayerStats,
  getSeasonChampions,
  getPlayerFormInSeason,
  addSeason,
  updateSeason,
  deleteSeason,
  
  // Utility functions
  updatePlayerStats,
  revertPlayerStats
};
