
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchListItem from "@/components/matches/MatchListItem";
import { Match } from "@/types";

interface RecentMatchesListProps {
  matches: Match[];
}

const RecentMatchesList = ({ matches }: RecentMatchesListProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Latest 5 football matches</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No matches found</p>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <MatchListItem 
                key={match.id} 
                match={match} 
                onDeleteClick={() => {}} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMatchesList;
