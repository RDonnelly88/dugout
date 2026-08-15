
import { Match } from "@/types";
import { supabase } from "@/lib/supabase-browser";
import { mapMatchToSupabase, mapSupabaseMatchToMatch } from "../supabase-utils";
import { getMatches } from "./match-retrieval";
import { getCurrentSeason } from "../season-service";

// Add a new match
export const addMatch = async (match: Omit<Match, "id" | "createdAt" | "updatedAt">): Promise<Match> => {
  const now = new Date().toISOString();
  
  // The caller supplies the side names from the team's own settings. Defaulting
  // them here wrote "Team A" into the match, which then showed up beside the
  // team's actual names on the same page.
  //
  // No score is written either. A fixture has not been played, and defaulting
  // to nought recorded a nil-nil draw for a game nobody had turned up to.
  const matchWithFormattedTeams = {
    ...match,
    teamA: {
      name: match.teamA?.name,
      players: match.teamA?.players || [],
      ...(typeof match.teamA?.score === "number" && { score: match.teamA.score })
    },
    teamB: {
      name: match.teamB?.name,
      players: match.teamB?.players || [],
      ...(typeof match.teamB?.score === "number" && { score: match.teamB.score })
    },
    // Always ensure teamId is set
    teamId: match.teamId || localStorage.getItem("currentTeamId") || ""
  };
  
  // If no season is specified, try to get the current season
  if (!matchWithFormattedTeams.seasonId) {
    try {
      const currentSeason = await getCurrentSeason();
      if (currentSeason) {
        matchWithFormattedTeams.seasonId = currentSeason.id;
      }
    } catch (error) {
      console.error("Error getting current season:", error);
    }
  }
  
  const supabaseMatch = {
    ...mapMatchToSupabase(matchWithFormattedTeams),
    created_at: now,
    updated_at: now
  };
  
  try {
    // Log the match being created
    console.log("Creating match with team_id:", supabaseMatch.team_id);
    
    const { data, error } = await supabase
      .from("matches")
      .insert(supabaseMatch)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding match to Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      const matchWithId = {
        id: crypto.randomUUID(),
        ...matchWithFormattedTeams,
        createdAt: now,
        updatedAt: now
      };
      matches.push(matchWithId);
      localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
      return matchWithId;
    }
    
    // Map data to ensure it matches the Match type
    return mapSupabaseMatchToMatch(data);
  } catch (error) {
    console.error("Error adding match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    const matchWithId = {
      id: crypto.randomUUID(),
      ...matchWithFormattedTeams,
      createdAt: now,
      updatedAt: now
    };
    matches.push(matchWithId);
    localStorage.setItem("football-tracker-matches", JSON.stringify(matches));
    return matchWithId;
  }
};
