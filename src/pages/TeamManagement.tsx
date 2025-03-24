
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@/types/team";
import TeamMembersTable from "@/components/team/TeamMembersTable";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import JoinTeamForm from "@/components/team/JoinTeamForm";
import TeamShareCard from "@/components/team/TeamShareCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { PlusCircle, Users, Share2, UserPlus } from "lucide-react";

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
        console.log("Fetching team members for team:", currentTeam.id);
        
        // First try using the RPC function which has been tested to work
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_team_members', { team_id_param: currentTeam.id });
            
          if (rpcError) {
            console.error("Error in RPC function:", rpcError);
            throw rpcError;
          }
          
          console.log("Team members via RPC:", rpcData);
          
          return (rpcData || []).map((member: any) => ({
            id: member.id,
            user_id: member.user_id,
            team_id: member.team_id,
            role: member.role,
            created_at: member.created_at,
            username: member.username,
            avatar_url: member.avatar_url,
            profile: {
              username: member.username,
              avatar_url: member.avatar_url
            }
          } as TeamMember));
        } catch (rpcError) {
          console.error("Failed to use RPC function, falling back to direct query:", rpcError);
        }
        
        // Fallback to direct query if the RPC function fails
        const { data, error } = await supabase
          .from("team_members")
          .select(`
            id,
            user_id,
            team_id,
            role,
            created_at
          `)
          .eq("team_id", currentTeam.id)
          .order("created_at", { ascending: true });
        
        if (error) {
          console.error("Error in direct query:", error);
          throw error;
        }
        
        // For direct query, separately fetch the profile data if needed
        const userIds = data?.map(member => member.user_id) || [];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }
        
        // Create a map of user_id to profile for easy lookup
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
        
        console.log("Raw team members data:", data);
        console.log("Profiles data:", profilesData);
        
        // Map team members with their profiles
        return (data || []).map(member => {
          const profile = profilesMap[member.user_id];
          
          return {
            id: member.id,
            user_id: member.user_id,
            team_id: member.team_id,
            role: member.role,
            created_at: member.created_at,
            // Fix the TypeScript errors by ensuring we check if profile exists before accessing properties
            username: profile ? profile.username : undefined,
            avatar_url: profile ? profile.avatar_url : undefined,
            profile: profile ? {
              username: profile.username,
              avatar_url: profile.avatar_url
            } : undefined
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

  useEffect(() => {
    if (currentTeam) {
      console.log("Current team changed, refetching members:", currentTeam.id);
      refetch();
    }
  }, [currentTeam?.id, refetch]);

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
        
        setTimeout(() => refetch(), 500);
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

  if (!currentTeam) {
    return (
      <div className="container mx-auto py-8 max-w-7xl animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-white">Team Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-900/80 border-gray-800 shadow-xl hover:shadow-accent/5 transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-white">Create Your First Team</CardTitle>
              <CardDescription className="text-gray-400">Get started by creating a team to manage players and matches</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20" size="lg">
                    <PlusCircle className="h-5 w-5" />
                    Create New Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Team</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new team to organize your players and matches
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name" className="text-gray-300">Team Name</Label>
                      <Input
                        id="team-name"
                        placeholder="Enter team name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 focus:border-accent/50 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-700 hover:bg-gray-800 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleCreateTeam}
                      disabled={!newTeamName.trim() || isCreatingTeam}
                      className="bg-accent hover:bg-accent/90 text-white"
                    >
                      {isCreatingTeam ? "Creating..." : "Create Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          
          <JoinTeamForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/10">
              <PlusCircle className="h-4 w-4" />
              Create New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Team</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new team to organize your players and matches
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-gray-300">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 focus:border-accent/50 focus:ring-accent/20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || isCreatingTeam}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                {isCreatingTeam ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card className="bg-gray-900/80 border-gray-800 shadow-xl hover:shadow-accent/5 transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-accent" />
                Team Members
              </CardTitle>
              <CardDescription className="text-gray-400">Manage members of {currentTeam.name}</CardDescription>
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
        
        <div className="col-span-1 space-y-8">
          <TeamSwitcher />
          
          {userRole === "admin" && (
            <>
              <Card className="bg-gray-900/80 border-gray-800 shadow-xl hover:shadow-accent/5 transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Share2 className="h-5 w-5 text-accent" />
                    Share Team
                  </CardTitle>
                  <CardDescription className="text-gray-400">Share your team with others</CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamShareCard />
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/80 border-gray-800 shadow-xl hover:shadow-accent/5 transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserPlus className="h-5 w-5 text-accent" />
                    Invite Member
                  </CardTitle>
                  <CardDescription className="text-gray-400">Add new members to your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <InviteMemberForm 
                    currentTeam={currentTeam}
                    inviteToTeam={inviteToTeam}
                    refetch={refetch}
                  />
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Always show these options regardless of user role */}
          <Card className="bg-gray-900/80 border-gray-800 shadow-xl hover:shadow-accent/5 transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PlusCircle className="h-5 w-5 text-accent" />
                Create New Team
              </CardTitle>
              <CardDescription className="text-gray-400">Start a fresh team for your players and matches</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 w-full justify-center bg-accent hover:bg-accent/90 text-white shadow-md">
                    <PlusCircle className="h-4 w-4" />
                    Create New Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Team</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new team to organize your players and matches
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name" className="text-gray-300">Team Name</Label>
                      <Input
                        id="team-name"
                        placeholder="Enter team name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 focus:border-accent/50 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-700 hover:bg-gray-800 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleCreateTeam}
                      disabled={!newTeamName.trim() || isCreatingTeam}
                      className="bg-accent hover:bg-accent/90 text-white"
                    >
                      {isCreatingTeam ? "Creating..." : "Create Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          
          {/* Always show Join Team form regardless of user role */}
          <JoinTeamForm />
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
