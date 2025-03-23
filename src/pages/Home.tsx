
import { useTeam } from "@/contexts/TeamContext";
import CreateFirstTeam from "@/components/team/CreateFirstTeam";
import SelectTeam from "@/components/team/SelectTeam";
import Dashboard from "@/components/dashboard/Dashboard";

// Main home component
const Home = () => {
  const { userTeams, currentTeam } = useTeam();
  
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
