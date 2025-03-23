
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Plus, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeamSelector = () => {
  const { currentTeam, userTeams, userRole, switchTeam, createTeam } = useTeam();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreatingTeam(true);
    setDebugInfo(null);
    
    try {
      // Log the current user ID for debugging
      console.log("Creating team with user ID:", user?.id);
      
      const { error } = await createTeam(newTeamName);
      
      if (error) {
        console.error("Team creation detailed error:", error);
        setDebugInfo(`Error: ${JSON.stringify(error)}`);
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
      }
    } catch (error: any) {
      console.error("Team creation error:", error);
      setDebugInfo(`Exception: ${error.message}`);
      toast({
        title: "Team creation failed",
        description: "There was an error creating your team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  return (
    <div className="flex items-center">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-56 text-left font-normal border-gray-700 bg-gray-800 hover:bg-gray-700"
          >
            <span className="truncate">{currentTeam?.name || "Select a team"}</span>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 bg-gray-800 border-gray-700">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">
            Your teams
          </div>
          <div className="max-h-60 overflow-y-auto">
            {userTeams.map(team => (
              <button
                key={team.id}
                className="flex items-center justify-between w-full px-2.5 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  switchTeam(team.id);
                  setIsPopoverOpen(false);
                }}
              >
                <span className="truncate">{team.name}</span>
                {currentTeam?.id === team.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center w-full px-2.5 py-2 text-sm text-primary hover:bg-gray-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from bubbling up
                  setIsPopoverOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Team
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team to organize your players and matches
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                
                {debugInfo && (
                  <div className="p-2 bg-red-950 border border-red-800 rounded text-xs overflow-auto">
                    <p className="font-bold mb-1">Debug Information:</p>
                    <p className="font-mono whitespace-pre-wrap">{debugInfo}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || isCreatingTeam}
                >
                  {isCreatingTeam ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="border-t border-gray-700 px-2 py-1.5">
            <button
              className="flex items-center w-full px-2.5 py-2 text-sm hover:bg-gray-700 cursor-pointer"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {currentTeam && userRole === "admin" && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => alert("Team settings will be implemented soon")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TeamSelector;
