
import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SeasonChampion } from "@/types";

interface SeasonsSummaryTableProps {
  seasonsData: {
    id: string;
    name: string;
    isFinished: boolean;
    isCurrent: boolean;
    champions: SeasonChampion[];
  }[];
}

const SeasonsSummaryTable: React.FC<SeasonsSummaryTableProps> = ({ seasonsData }) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Seasons Summary</CardTitle>
        <CardDescription>
          Overview of all seasons with top performers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead>2nd Place</TableHead>
              <TableHead>3rd Place</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasonsData.map((season) => {
              const first = season.champions.find(c => c.rank === 1);
              const second = season.champions.find(c => c.rank === 2);
              const third = season.champions.find(c => c.rank === 3);
              
              return (
                <TableRow key={season.id}>
                  <TableCell>
                    <Link to={`/seasons/${season.id}`} className="hover:underline">
                      <div className="font-medium">{season.name}</div>
                      <div className="flex items-center mt-1">
                        {season.isCurrent && (
                          <Badge className="mr-2 bg-green-500 text-xs">Current</Badge>
                        )}
                        {season.isFinished && (
                          <Badge variant="outline" className="text-xs">Finished</Badge>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  
                  <TableCell>
                    {first ? (
                      <Link to={`/players/${first.playerId}`} className="flex items-center space-x-2 hover:underline">
                        <Avatar className="h-6 w-6 bg-gray-800">
                          <AvatarImage src={first.playerImage} alt={first.playerName} />
                          <AvatarFallback>{first.playerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center">
                          <span>{first.playerName}</span>
                          <Trophy className="h-4 w-4 ml-1 text-amber-400" />
                        </div>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {season.isFinished ? "No champion" : "In progress"}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {second ? (
                      <Link to={`/players/${second.playerId}`} className="flex items-center space-x-2 hover:underline">
                        <Avatar className="h-6 w-6 bg-gray-800">
                          <AvatarImage src={second.playerImage} alt={second.playerName} />
                          <AvatarFallback>{second.playerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center">
                          <span>{second.playerName}</span>
                          <Medal className="h-4 w-4 ml-1 text-slate-400" />
                        </div>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {third ? (
                      <Link to={`/players/${third.playerId}`} className="flex items-center space-x-2 hover:underline">
                        <Avatar className="h-6 w-6 bg-gray-800">
                          <AvatarImage src={third.playerImage} alt={third.playerName} />
                          <AvatarFallback>{third.playerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center">
                          <span>{third.playerName}</span>
                          <Medal className="h-4 w-4 ml-1 text-amber-700" />
                        </div>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SeasonsSummaryTable;
