
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const CreateFirstTeam = () => {
  const { createTeam } = useTeam();
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const { error } = await createTeam(teamName);
      
      if (error) {
        toast({
          title: "Error creating team",
          description: error.message || "Failed to create team",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating team",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader>
          <CardTitle>Create Your First Team</CardTitle>
          <CardDescription>
            Create a team to start managing players and matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTeam();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating || !teamName.trim()}>
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFirstTeam;
