
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MatchListItem from "@/components/matches/MatchListItem";
import { Match } from "@/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteMatch } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

interface RecentMatchesListProps {
  matches: Match[];
}

const RecentMatchesList = ({ matches }: RecentMatchesListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Setup delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match deleted",
        description: "The match has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (matchId: string) => {
    deleteMutation.mutate(matchId);
  };

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
                onDeleteClick={() => handleDeleteClick(match.id)} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMatchesList;
