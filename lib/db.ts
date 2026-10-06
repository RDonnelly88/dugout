
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

// Export the season results functions from season-results-service
import { getPlayerResultsInSeason } from "./season-results-service";

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
  
  // Season results functions
  getPlayerResultsInSeason,
};
