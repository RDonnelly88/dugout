
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type TeamMember = {
  id: string;
  user_id: string;
  team_id: string;
  role: "admin" | "viewer";
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
};

const TeamManagement = () => {
  const { currentTeam, userRole, inviteToTeam } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer");
  const [isInviting, setIsInviting] = useState(false);

  // Fetch team members
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
      return data as TeamMember[];
    },
    enabled: !!currentTeam,
  });

  const handleInvite = async () => {
    if (!currentTeam || !inviteEmail.trim()) return;
    
    setIsInviting(true);
    
    try {
      const { error } = await inviteToTeam(currentTeam.id, inviteEmail, inviteRole);
      
      if (error) {
        toast({
          title: "Invitation failed",
          description: error.message || "Failed to invite user",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invitation sent",
          description: `${inviteEmail} has been invited to the team`,
        });
        setInviteEmail("");
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Invitation failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!currentTeam || memberUserId === user?.id) return;
    
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);
      
      if (error) throw error;
      
      toast({
        title: "Member removed",
        description: "The team member has been removed",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "viewer") => {
    if (!currentTeam) return;
    
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);
      
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `The member's role has been updated to ${newRole}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update member role",
        variant: "destructive",
      });
    }
  };

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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : teamMembers.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No members found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      {userRole === "admin" && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.profile.username}</TableCell>
                        <TableCell>
                          {userRole === "admin" && member.user_id !== user?.id ? (
                            <Select
                              defaultValue={member.role}
                              onValueChange={(value) => 
                                handleUpdateRole(member.id, value as "admin" | "viewer")
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={member.role === "admin" ? "text-blue-400" : ""}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        {userRole === "admin" && (
                          <TableCell className="text-right">
                            {member.user_id !== user?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id, member.user_id)}
                              >
                                Remove
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleInvite();
                  }}
                >
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium">
                      Role
                    </label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value) => setInviteRole(value as "admin" | "viewer")}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isInviting}>
                    {isInviting ? "Inviting..." : "Invite Member"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
