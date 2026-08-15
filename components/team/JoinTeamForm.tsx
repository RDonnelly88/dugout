
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JoinTeamForm = () => {
  const [teamId, setTeamId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [formError, setFormError] = useState("");
  const { joinTeamById } = useTeam();
  const { toast } = useToast();

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!teamId.trim()) {
      setFormError("Please enter a team ID to join");
      toast({
        title: "Missing team ID",
        description: "Please enter a team ID to join",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    
    try {
      console.log("Attempting to join team with ID:", teamId);
      const { error, success } = await joinTeamById(teamId);
      
      if (error) {
        console.error("Failed to join team:", error);
        setFormError(error.message || String(error));
        toast({
          title: "Failed to join team",
          description: error.message || String(error),
          variant: "destructive",
        });
      } else if (success) {
        console.log("Successfully joined team");
        toast({
          title: "Team joined",
          description: "You have successfully joined the team",
        });
        setTeamId("");
        setFormError("");
      }
    } catch (error: any) {
      console.error("Error joining team:", error);
      setFormError(error.message || "An unknown error occurred");
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
        {formError && (
          <Alert variant="destructive" className="mb-4 border-red-900 bg-red-950">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
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
            className="w-full bg-primary hover:bg-primary/90"
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
