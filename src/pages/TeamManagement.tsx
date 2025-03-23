
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@/types/team";
import TeamMembersTable from "@/components/team/TeamMembersTable";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

const TeamManagement = () => {
  const { currentTeam, userRole, inviteToTeam, createTeam } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const { data: teamMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["teamMembers", currentTeam?.id],
    queryFn: async () => {
      if (!currentTeam) return [];
      
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select(`
            id,
            user_id,
            team_id,
            role,
            created_at,
            profiles(username, avatar_url)
          `)
          .eq("team_id", currentTeam.id)
          .order("created_at", { ascending: true });
        
        if (error) throw error;
        
        console.log("Raw team members data:", data);
        
        // Define a default profile object to use when profile data is missing
        const defaultProfile = { username: 'Unknown User', avatar_url: null };
        
        return (data || []).map(member => {
          // Safely access profile data
          const profile = member.profiles || defaultProfile;
          
          // Construct the TeamMember object with all required fields
          return {
            id: member.id,
            user_id: member.user_id,
            team_id: member.team_id,
            role: member.role,
            created_at: member.created_at,
            profile: {
              username: typeof profile === 'object' ? (profile.username || defaultProfile.username) : defaultProfile.username,
              avatar_url: typeof profile === 'object' ? profile.avatar_url : null
            }
          } as TeamMember;
        });
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast({
          title: "Error fetching team members",
          description: "Please try again later",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!currentTeam,
  });

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreatingTeam(true);
    
    try {
      const { error } = await createTeam(newTeamName);
      
      if (error) {
        console.error("Team creation error:", error);
        toast({
          title: "Team creation failed",
          description: error.message || "There was an error creating your team. Please try again.",
          variant: "destructive",
        });
      } else {
        setNewTeamName("");
        setIsCreateDialogOpen(false);
        toast({
          title: "Team created",
          description: `Team "${newTeamName}" has been created successfully`,
        });
      }
    } catch (error: any) {
      console.error("Team creation error:", error);
      toast({
        title: "Team creation failed",
        description: "There was an error creating your team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  if (error) {
    console.error("Team members query error:", error);
  }

  if (!currentTeam) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Team Management</h1>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Create Your First Team</CardTitle>
            <CardDescription>Get started by creating a team to manage players and matches</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" size="lg">
                  <PlusCircle className="h-5 w-5" />
                  Create New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team to organize your players and matches
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim() || isCreatingTeam}
                  >
                    {isCreatingTeam ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
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
        
        <div className="col-span-1">
          {userRole === "admin" ? (
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
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Create New Team</CardTitle>
                <CardDescription>Start a fresh team for your players and matches</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 w-full justify-center">
                      <PlusCircle className="h-4 w-4" />
                      Create New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Create a new team to organize your players and matches
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                          id="team-name"
                          placeholder="Enter team name"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleCreateTeam}
                        disabled={!newTeamName.trim() || isCreatingTeam}
                      >
                        {isCreatingTeam ? "Creating..." : "Create Team"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
