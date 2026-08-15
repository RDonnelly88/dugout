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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 shrink-0 text-draw" />
          <span className="truncate">{currentSeason.name}</span>
          {currentSeason.isFinished && (
            <Badge className="bg-loss text-loss-foreground">Finished</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Current season · {new Date(currentSeason.startDate).toLocaleDateString()}
          {currentSeason.endDate
            ? ` – ${new Date(currentSeason.endDate).toLocaleDateString()}`
            : " – ongoing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-info" />
            {seasonPlayerStats.length} have featured
          </span>
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link href={`/seasons/${currentSeason.id}`}>View the league table</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSeasonCard;
