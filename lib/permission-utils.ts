
import { useTeam } from "@/contexts/TeamContext";

// Helper functions to check permission
export const usePermission = () => {
  const { userRole, isTeamAdmin, currentTeam } = useTeam();
  
  // Check if user can manage players, matches, seasons
  const canManage = () => {
    return userRole === "admin" && !!currentTeam;
  };
  
  // Check if user can view players, matches, seasons
  const canView = () => {
    return (userRole === "admin" || userRole === "viewer") && !!currentTeam;
  };
  
  // Check if there's a team selected
  const hasTeam = () => {
    return !!currentTeam;
  };
  
  return {
    canManage,
    canView,
    hasTeam,
    isAdmin: isTeamAdmin()
  };
};
