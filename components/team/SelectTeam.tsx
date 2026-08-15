
import { useTeam } from "@/contexts/TeamContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SelectTeam = () => {
  const { userTeams, switchTeam } = useTeam();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader>
          <CardTitle>Select a Team</CardTitle>
          <CardDescription>
            Choose a team to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userTeams.map(team => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => switchTeam(team.id)}
              >
                {team.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectTeam;
