import Link from "next/link";

import React from "react";

import { Season, SeasonPlayerStats } from "@/types";
import { Trophy, CalendarDays } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CurrentSeasonCardProps {
  currentSeason: Season | undefined;
  seasonPlayerStats: SeasonPlayerStats[];
}

const CurrentSeasonCard: React.FC<CurrentSeasonCardProps> = ({
  currentSeason,
  seasonPlayerStats,
}) => {
  if (!currentSeason) {
    return null;
  }

  return (
    <Card className="mb-6 bg-surface border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-draw" />
          Current Season: {currentSeason.name}
        </CardTitle>
        <CardDescription>
          {new Date(currentSeason.startDate).toLocaleDateString()} - 
          {currentSeason.endDate ? new Date(currentSeason.endDate).toLocaleDateString() : " Ongoing"}
          {currentSeason.isFinished && <Badge className="ml-2 bg-loss">Finished</Badge>}
          {currentSeason.isCurrent && !currentSeason.isFinished && <Badge className="ml-2 bg-win">Active</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-info" />
            <span className="text-sm text-muted-foreground">
              {seasonPlayerStats.length} Active Players
            </span>
          </div>
          <div>
            <Button variant="link" size="sm" asChild className="text-info p-0">
              <Link href={`/seasons/${currentSeason.id}`}>View League Table</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSeasonCard;
