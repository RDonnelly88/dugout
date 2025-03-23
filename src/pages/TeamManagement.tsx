
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@/types/team";
import TeamMembersTable from "@/components/team/TeamMembersTable";
import InviteMemberForm from "@/components/team/InviteMemberForm";

const TeamManagement = () => {
  const { currentTeam, userRole, inviteToTeam } = useTeam();
  const { user } = useAuth();

  const { data: teamMembers = [], isLoading, refetch } = useQuery({
    queryKey: ["teamMembers", currentTeam?.id],
    queryFn: async () => {
      if (!currentTeam) return [];
      
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          team_id,
          role,
          created_at,
          profile:profiles(username, avatar_url)
        `)
        .eq("team_id", currentTeam.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Define a default profile object to use when profile data is missing
      const defaultProfile = { username: 'Unknown User', avatar_url: null };
      
      return (data || []).map(member => {
        // Create a safe profile object with a guaranteed structure
        const profile = member.profile && 
                      typeof member.profile === 'object' && 
                      !Array.isArray(member.profile) && 
                      member.profile !== null && 
                      !('error' in member.profile)
                        ? member.profile
                        : defaultProfile;
          
        // Construct the TeamMember object with all required fields
        return {
          id: member.id,
          user_id: member.user_id,
          team_id: member.team_id,
          role: member.role,
          created_at: member.created_at,
          // Ensure profile is never null
          profile: {
            username: profile.username || defaultProfile.username,
            avatar_url: profile.avatar_url
          }
        } as TeamMember;
      });
    },
    enabled: !!currentTeam,
  });

  if (!currentTeam) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-400">Please select a team first</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage members of {currentTeam.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersTable 
                teamMembers={teamMembers}
                isLoading={isLoading}
                userRole={userRole}
                currentTeamId={currentTeam.id}
                refetch={refetch}
              />
            </CardContent>
          </Card>
        </div>
        
        {userRole === "admin" && (
          <div className="col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Invite Member</CardTitle>
                <CardDescription>Add new members to your team</CardDescription>
              </CardHeader>
              <CardContent>
                <InviteMemberForm 
                  currentTeam={currentTeam}
                  inviteToTeam={inviteToTeam}
                  refetch={refetch}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
