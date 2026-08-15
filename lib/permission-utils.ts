import { useTeam } from "@/contexts/TeamContext";

/**
 * What the signed-in member is allowed to do in the current team.
 *
 * `ready` is the important one. Teams are fetched after the first paint, so
 * until they arrive there is no current team and every permission answers
 * false — which is indistinguishable from "not allowed". A page that redirects
 * on `!canManage()` without waiting therefore bounced everyone away from
 * /matches/create before the answer was known.
 */
export const usePermission = () => {
  const { userRole, isTeamAdmin, currentTeam, loading } = useTeam();

  return {
    /** False until the team has loaded. Guard redirects on this. */
    ready: !loading,
    canManage: () => userRole === "admin" && !!currentTeam,
    canView: () =>
      (userRole === "admin" || userRole === "viewer") && !!currentTeam,
    hasTeam: () => !!currentTeam,
    isAdmin: isTeamAdmin(),
  };
};
