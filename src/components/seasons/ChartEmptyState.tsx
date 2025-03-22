
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ChartEmptyStateProps {
  seasonName?: string;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ seasonName }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Tracking</CardTitle>
        <CardDescription>
          {seasonName ? `Player position changes in ${seasonName}` : 'Player position changes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-10">
        <Users className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Not enough matches played to track positions.
        </p>
      </CardContent>
    </Card>
  );
};

export default ChartEmptyState;
