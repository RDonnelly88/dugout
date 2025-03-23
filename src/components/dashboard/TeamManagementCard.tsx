
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeamSwitcher from "@/components/team/TeamSwitcher";

const TeamManagementCard = () => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>Manage your current team</CardDescription>
      </CardHeader>
      <CardContent>
        <TeamSwitcher variant="card" />
      </CardContent>
    </Card>
  );
};

export default TeamManagementCard;
