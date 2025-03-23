
import { useTeam } from "@/contexts/TeamContext";

// Helper functions to check permission
export const usePermission = () => {
  const { userRole, isTeamAdmin } = useTeam();
  
  // Check if user can manage players, matches, seasons
  const canManage = () => {
    return userRole === "admin";
  };
  
  // Check if user can view players, matches, seasons
  const canView = () => {
    return userRole === "admin" || userRole === "viewer";
  };
  
  return {
    canManage,
    canView,
    isAdmin: isTeamAdmin()
  };
};
