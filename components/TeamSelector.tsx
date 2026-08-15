
import { useState, useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Plus, LogOut, Settings, Users } from "lucide-react";
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

  // Close create dialog when team creation is successful
  useEffect(() => {
    if (currentTeam && isCreateDialogOpen) {
      setIsCreateDialogOpen(false);
    }
  }, [currentTeam, isCreateDialogOpen]);

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
        console.log("Team creation successful in TeamSelector");
        setNewTeamName("");
        setIsCreateDialogOpen(false);
        setIsPopoverOpen(false);
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

  const handleTeamSwitch = (teamId: string, e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    switchTeam(teamId);
    setIsPopoverOpen(false);
  };

  const handleCreateTeamClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCreateDialogOpen(true);
    setIsPopoverOpen(false);
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    signOut();
  };

  return (
    <div className="flex items-center">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-56 text-left font-normal border-border bg-surface-2 hover:bg-gray-700"
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="truncate">{currentTeam?.name || "Select a team"}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 bg-surface-2 border-border z-50">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Your teams
          </div>
          <div className="max-h-60 overflow-y-auto">
            {userTeams.map(team => (
              <button
                key={team.id}
                className="flex items-center justify-between w-full px-2.5 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                onClick={(e) => handleTeamSwitch(team.id, e)}
              >
                <span className="truncate">{team.name}</span>
                {currentTeam?.id === team.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="w-full">
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              // Only close popover when dialog is opened, not when closed
              if (open) {
                setIsPopoverOpen(false);
              }
            }}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center w-full px-2.5 py-2 text-sm text-primary hover:bg-gray-700 cursor-pointer"
                  onClick={handleCreateTeamClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Team
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-surface border-border z-50">
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
          </div>
          <div className="border-t border-border px-2 py-1.5">
            <button
              className="flex items-center w-full px-2.5 py-2 text-sm hover:bg-gray-700 cursor-pointer"
              onClick={handleSignOut}
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
          className="ml-2 text-muted-foreground hover:text-foreground hover:bg-surface-2"
          onClick={() => alert("Team settings will be implemented soon")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TeamSelector;
