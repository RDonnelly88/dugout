
import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
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
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the team ID manually",
        variant: "destructive",
      });
    }
  };

  if (!currentTeam) return null;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Share Team</CardTitle>
        <CardDescription>Share this ID to invite others to join your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={currentTeam.id}
            readOnly
            className="bg-gray-800 border-gray-700 font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyTeamId}
            className="flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Users can join your team by entering this ID in their Join Team form.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeamShareCard;
