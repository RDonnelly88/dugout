
import { supabase } from "@/integrations/supabase/client";
import { getMatches } from "./match-retrieval";
import { getMatch } from "./match-retrieval";
import { revertPlayerStats } from "../player-service";

// Delete a match
export const deleteMatch = async (id: string): Promise<boolean> => {
  try {
    // First get the match to revert player stats if needed
    const match = await getMatch(id);
    
    // If match was completed, revert player stats before deletion
    if (match && match.status === "completed") {
      await revertPlayerStats(match);
    }
    
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting match from Supabase:", error);
      // Fallback to localStorage
      const matches = await getMatches();
      
      // Store completed match data before removal to revert player stats
      const matchToDelete = matches.find(match => match.id === id);
      
      const filteredMatches = matches.filter(match => match.id !== id);
      
      if (filteredMatches.length !== matches.length) {
        localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
        
        // If the match was completed, revert player stats
        if (matchToDelete && matchToDelete.status === "completed") {
          await revertPlayerStats(matchToDelete);
        }
        
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting match:", error);
    // Fallback to localStorage
    const matches = await getMatches();
    
    // Store completed match data before removal to revert player stats
    const matchToDelete = matches.find(match => match.id === id);
    
    const filteredMatches = matches.filter(match => match.id !== id);
    
    if (filteredMatches.length !== matches.length) {
      localStorage.setItem("football-tracker-matches", JSON.stringify(filteredMatches));
      
      // If the match was completed, revert player stats
      if (matchToDelete && matchToDelete.status === "completed") {
        await revertPlayerStats(matchToDelete);
      }
      
      return true;
    }
    
    return false;
  }
};
