
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TeamSwitcher = () => {
  const { currentTeam, userTeams, switchTeam } = useTeam();
  const { toast } = useToast();

  const handleTeamChange = (teamId: string) => {
    if (teamId === currentTeam?.id) return;
    
    switchTeam(teamId);
    toast({
      title: "Team switched",
      description: `You are now managing ${userTeams.find(t => t.id === teamId)?.name || "your new team"}`,
    });
  };

  if (userTeams.length <= 1) {
    return null; // Don't show the switcher if there's only one team
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Switch Team</CardTitle>
        <CardDescription>Change which team you're managing</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={currentTeam?.id || ""}
          onValueChange={handleTeamChange}
        >
          <SelectTrigger className="w-full bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {userTeams.map(team => (
              <SelectItem key={team.id} value={team.id} className="hover:bg-gray-700">
                <div className="flex items-center justify-between w-full">
                  <span>{team.name}</span>
                  {currentTeam?.id === team.id && (
                    <Check className="h-4 w-4 ml-2 text-primary" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default TeamSwitcher;
