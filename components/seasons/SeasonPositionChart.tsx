
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";
import { prepareChartData, getPlayersToShow } from "./chart-utils";
import ChartLoadingState from "./ChartLoadingState";
import ChartEmptyState from "./ChartEmptyState";
import PositionLineChart from "./PositionLineChart";
import PlayerLegend from "./PlayerLegend";

interface SeasonPositionChartProps {
  seasonId: string;
  seasonName?: string;
}

const SeasonPositionChart: React.FC<SeasonPositionChartProps> = ({ 
  seasonId,
  seasonName 
}) => {
  const { data: positionHistories = [], isLoading } = usePlayerPositionHistory(seasonId);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  
  // Format the data for the chart
  const chartData = useMemo(() => 
    prepareChartData(positionHistories), 
  [positionHistories]);
  
  // Limit the number of players shown if there are many
  const playersToShow = useMemo(() => 
    getPlayersToShow(positionHistories, showAllPlayers),
  [positionHistories, showAllPlayers]);
  
  if (isLoading) {
    return <ChartLoadingState seasonName={seasonName} />;
  }
  
  if (!positionHistories.length) {
    return <ChartEmptyState seasonName={seasonName} />;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Position Tracking
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>This chart shows how players' league positions changed after each match in the season.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              {seasonName ? `Player position changes in ${seasonName}` : 'Player position changes after each match'}
            </CardDescription>
          </div>
          {positionHistories.length > 5 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              className="text-xs"
            >
              {showAllPlayers ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Top 5
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show All Players
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mt-4">
          <PositionLineChart 
            chartData={chartData} 
            players={playersToShow} 
            hoveredPlayerId={hoveredPlayerId} 
          />
        </div>
        
        <PlayerLegend 
          players={playersToShow} 
          hoveredPlayerId={hoveredPlayerId}
          setHoveredPlayerId={setHoveredPlayerId}
        />
      </CardContent>
    </Card>
  );
};

export default SeasonPositionChart;
