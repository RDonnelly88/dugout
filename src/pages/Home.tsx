
import { useTeam } from "@/contexts/TeamContext";
import CreateFirstTeam from "@/components/team/CreateFirstTeam";
import SelectTeam from "@/components/team/SelectTeam";
import Dashboard from "@/components/dashboard/Dashboard";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Main home component
const Home = () => {
  const { userTeams, currentTeam } = useTeam();
  const queryClient = useQueryClient();
  
  // Force refresh data when team changes
  useEffect(() => {
    if (currentTeam) {
      // Invalidate all relevant query keys when team changes
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["currentSeason"] });
      queryClient.invalidateQueries({ queryKey: ["seasonPlayerStats"] });
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      // Force clear cache for batch player forms
      queryClient.removeQueries({ queryKey: ["batchPlayerForms"] });
      console.log("Home: Refreshing data for team:", currentTeam.id);
    }
  }, [currentTeam?.id, queryClient]);
  
  // If user has no teams, show create team UI
  if (userTeams.length === 0) {
    return <CreateFirstTeam />;
  }

  // If user has teams but none selected, show select team UI
  if (!currentTeam) {
    return <SelectTeam />;
  }
  
  return <Dashboard />;
};

export default Home;
