"use client";


import { useTeam } from "@/contexts/TeamContext";
import { supabase } from "@/lib/supabase-browser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TeamMember } from "@/types/team";
import TeamMembersTable from "@/components/team/TeamMembersTable";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import JoinTeamForm from "@/components/team/JoinTeamForm";
import TeamShareCard from "@/components/team/TeamShareCard";
import SideNamesCard from "@/components/team/SideNamesCard";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { PlusCircle, Users, UserPlus } from "lucide-react";

const TeamManagement = () => {
  const { currentTeam, userRole, inviteToTeam, createTeam } = useTeam();
  const teamId = currentTeam?.id;
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const { data: teamMembers = [], isLoading, refetch } = useQuery({
    queryKey: ["teamMembers", currentTeam?.id],
    queryFn: async () => {
      if (!currentTeam) return [];
      
      try {
        
        // First try using the RPC function which has been tested to work
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_team_members', { team_id_param: currentTeam.id });
            
          if (rpcError) {
            console.error("Error in RPC function:", rpcError);
            throw rpcError;
          }
          
          
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
    if (teamId) {
      refetch();
    }
  }, [teamId, refetch]);

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

  // One dialog for the page, opened from wherever "Create a team" is offered.
  const createDialog = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create a team</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A fresh squad, with its own players, matches and seasons.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name" className="text-muted-foreground">Team name</Label>
            <Input
              id="team-name"
              placeholder="Monday five-a-side"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="bg-surface-2/50 border-border focus:border-accent/50 focus:ring-accent/20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateTeam} disabled={!newTeamName.trim() || isCreatingTeam}>
            {isCreatingTeam ? "Creating..." : "Create team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const createButton = (
    <Button variant="outline" className="w-full gap-2" onClick={() => setIsCreateDialogOpen(true)}>
      <PlusCircle className="h-4 w-4" />
      Create a team
    </Button>
  );

  if (!currentTeam) {
    return (
      <div className="page-container animate-fade-in">
        <PageHeader title="Team" subtitle="Create a team to start recording players and matches." />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start a team</CardTitle>
              <CardDescription>You will be its admin, and can invite the rest.</CardDescription>
            </CardHeader>
            <CardContent>{createButton}</CardContent>
          </Card>
          <JoinTeamForm />
        </div>
        {createDialog}
      </div>
    );
  }

  const admin = userRole === "admin";

  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Team" subtitle={`Who can see and change ${currentTeam.name}.`} />

      {/* What a team's admin comes here to do comes first; starting or
          joining another team is something done once, so it sits last. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Members
              </CardTitle>
              <CardDescription>
                Admins can add results and change the squad; viewers can look round.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersTable
                teamMembers={teamMembers}
                isLoading={isLoading}
                userRole={userRole}
                currentTeamId={currentTeam.id}
                refetch={refetch}
              />
              {admin && (
                <div className="mt-6 border-t border-border pt-6">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold">
                    <UserPlus className="h-4 w-4 text-accent" />
                    Invite somebody
                  </h4>
                  <InviteMemberForm currentTeam={currentTeam} inviteToTeam={inviteToTeam} refetch={refetch} />
                </div>
              )}
            </CardContent>
          </Card>

          {admin && <TeamShareCard />}
          {admin && <SideNamesCard />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Other teams</CardTitle>
              <CardDescription>Switch to another squad, start one, or join one by its ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <TeamSwitcher />
              {createButton}
            </CardContent>
          </Card>
          <JoinTeamForm />
        </div>
      </div>
      {createDialog}
    </div>
  );
};

export default TeamManagement;
