
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeamShareCard = () => {
  const { currentTeam } = useTeam();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyTeamId = async () => {
    if (!currentTeam) return;
    
    try {
      await navigator.clipboard.writeText(currentTeam.id);
      setCopied(true);
      toast({
        title: "Team ID Copied",
        description: "Team ID has been copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the team ID manually",
        variant: "destructive",
      });
    }
  };

  const shareTeam = async () => {
    if (!currentTeam) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my team: ${currentTeam.name}`,
          text: `Use this ID to join my team in the app: ${currentTeam.id}`,
        });
        
        toast({
          title: "Team shared",
          description: "Team sharing dialog opened",
        });
      } catch (error) {
        console.log("Error sharing:", error);
        handleCopyTeamId();
      }
    } else {
      handleCopyTeamId();
    }
  };

  if (!currentTeam) return null;

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share Team
        </CardTitle>
        <CardDescription>Share this ID to invite others to join your team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex space-x-2">
          <Input
            value={currentTeam.id}
            readOnly
            className="bg-surface-2 border-border font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyTeamId}
            className="flex-shrink-0 border-border hover:bg-gray-700"
          >
            {copied ? <Check className="h-4 w-4 text-win" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={shareTeam}
        >
          <Share2 className="h-4 w-4 mr-2" /> Share Team
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Users can join your team by entering this ID in their Join Team form.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeamShareCard;
