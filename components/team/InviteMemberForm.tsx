
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Team } from "@/types/team";

interface InviteMemberFormProps {
  currentTeam: Team;
  inviteToTeam: (teamId: string, email: string, role: "admin" | "viewer") => Promise<{ error: any | null }>;
  refetch: () => void;
}

const InviteMemberForm = ({ currentTeam, inviteToTeam, refetch }: InviteMemberFormProps) => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer");
  const [isInviting, setIsInviting] = useState(false);

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

  return (
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
  );
};

export default InviteMemberForm;
