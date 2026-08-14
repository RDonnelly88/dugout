
// This file re-exports all database functions to maintain backwards compatibility
import { getPlayers, getPlayer, addPlayer, updatePlayer, deletePlayer } from "./player-service";
import { getMatches, getMatch, addMatch, updateMatch, deleteMatch } from "./match-service";
import { 
  getSeasons, 
  getSeason, 
  getCurrentSeason, 
  getSeasonPlayerStats, 
  getSeasonChampions,
  addSeason,
  updateSeason,
  deleteSeason
} from "./season-service";

// Export the player form functions from player-form-service
import { getPlayerFormInSeason } from "./player-form-service";

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
  addSeason,
  updateSeason,
  deleteSeason,
  
  // Player form functions
  getPlayerFormInSeason,
};
