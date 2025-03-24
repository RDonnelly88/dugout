
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeam } from "@/contexts/TeamContext";

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  userRole: string | null;
  currentTeamId: string;
  refetch: () => void;
}

const TeamMembersTable = ({
  teamMembers,
  isLoading,
  userRole,
  currentTeamId,
  refetch
}: TeamMembersTableProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateMemberRole } = useTeam();

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!currentTeamId || memberUserId === user?.id) return;
    
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
    if (!currentTeamId) return;
    
    try {
      const { error } = await updateMemberRole(memberId, newRole);
      
      if (error) throw error;
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No members found. This is unusual - try refreshing the page.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={refetch}
        >
          Refresh Members
        </Button>
      </div>
    );
  }

  return (
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
          <TableRow key={member.id} className={member.user_id === user?.id ? "bg-gray-800/30" : ""}>
            <TableCell className="font-medium">
              {member.profile?.username || member.username || 'Unknown User'}
              {member.user_id === user?.id && <span className="ml-2 text-xs text-gray-400">(You)</span>}
            </TableCell>
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
  );
};

export default TeamMembersTable;
