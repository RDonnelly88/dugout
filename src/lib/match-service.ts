
// Re-export all match-related functions
import { getMatches, getMatch } from "./match/match-retrieval";
import { addMatch } from "./match/match-creation";
import { updateMatch } from "./match/match-update";
import { deleteMatch } from "./match/match-deletion";

export {
  getMatches,
  getMatch,
  addMatch,
  updateMatch,
  deleteMatch
};
