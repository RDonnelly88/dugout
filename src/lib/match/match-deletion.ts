
import { supabase } from "@/integrations/supabase/client";
import { getMatches } from "./match-retrieval";

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
