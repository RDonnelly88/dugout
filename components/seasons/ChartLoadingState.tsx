
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ChartLoadingStateProps {
  seasonName?: string;
}

const ChartLoadingState: React.FC<ChartLoadingStateProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Position after each match</CardTitle>
        <CardDescription>
          Loading position history...
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        <div className="animate-pulse w-full h-48 bg-surface-2 rounded"></div>
      </CardContent>
    </Card>
  );
};

export default ChartLoadingState;
