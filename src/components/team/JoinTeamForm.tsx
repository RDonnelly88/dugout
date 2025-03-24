
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const JoinTeamForm = () => {
  const [teamId, setTeamId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinTeamById } = useTeam();
  const { toast } = useToast();

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamId.trim()) {
      toast({
        title: "Missing team ID",
        description: "Please enter a team ID to join",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    
    try {
      const { error, success } = await joinTeamById(teamId);
      
      if (error) {
        toast({
          title: "Failed to join team",
          description: error.message || String(error),
          variant: "destructive",
        });
      } else if (success) {
        setTeamId("");
      }
    } catch (error: any) {
      toast({
        title: "Error joining team",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Join Existing Team</CardTitle>
        <CardDescription>Enter a team ID to join as a member</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter team ID"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Button 
            type="submit"
            className="w-full"
            disabled={isJoining || !teamId.trim()}
          >
            {isJoining ? "Joining..." : "Join Team"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinTeamForm;
