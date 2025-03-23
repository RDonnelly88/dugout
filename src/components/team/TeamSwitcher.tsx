
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, Users } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const TeamSwitcher = ({ variant = "default" }: { variant?: "default" | "minimal" | "card" }) => {
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
    return variant === "minimal" ? (
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-2 text-gray-400" />
        <span className="text-sm font-medium">{currentTeam?.name || "No team"}</span>
      </div>
    ) : null;
  }

  if (variant === "minimal") {
    return (
      <Select
        value={currentTeam?.id || ""}
        onValueChange={handleTeamChange}
      >
        <SelectTrigger className="bg-transparent border-0 h-8 p-0 text-sm font-medium hover:bg-gray-800 hover:px-2 transition-all">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Select a team" />
          </div>
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
    );
  }

  if (variant === "card") {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Current Team</CardTitle>
          <CardDescription>You are currently managing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-3 py-1 text-base">
              <Users className="h-4 w-4 mr-2" />
              {currentTeam?.name || "No team selected"}
            </Badge>
            <Select
              value={currentTeam?.id || ""}
              onValueChange={handleTeamChange}
            >
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Switch team" />
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
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
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
