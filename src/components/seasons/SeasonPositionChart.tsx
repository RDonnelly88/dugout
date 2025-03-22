
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, Ghost, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { usePlayerPositionHistory, PlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";
import { format, parseISO } from "date-fns";

// Custom colors for the lines
const CHART_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", 
  "#118AB2", "#073B4C", "#EF476F", "#FFC43D", 
  "#1B9AAA", "#6A0572", "#AB83A1", "#F15BB5", 
  "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"
];

// Helper function to format the date - moved to the top level before any usage
const formatDate = (dateString: string) => {
  try {
    // Check if the date is in ISO format or other format
    if (dateString.includes('T')) {
      return format(parseISO(dateString), 'MMM d');
    } else {
      // Try to parse the date string
      return format(new Date(dateString), 'MMM d');
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

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
  const chartData = useMemo(() => {
    if (!positionHistories.length) return [];
    
    // Create a map of all unique match dates across all players
    const allMatchDates = new Set<string>();
    positionHistories.forEach(player => {
      player.history.forEach(point => {
        allMatchDates.add(point.matchDate);
      });
    });
    
    // Sort dates chronologically
    const sortedDates = Array.from(allMatchDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Create data points for each date
    return sortedDates.map((date, index) => {
      const dataPoint: any = {
        date,
        matchNumber: index + 1,
        formattedDate: formatDate(date)
      };
      
      // Add each player's position for this date
      positionHistories.forEach(player => {
        const historyPoint = player.history.find(h => h.matchDate === date);
        if (historyPoint) {
          dataPoint[player.playerId] = historyPoint.position;
          dataPoint[`${player.playerId}_name`] = player.playerName;
        }
      });
      
      return dataPoint;
    });
  }, [positionHistories]);
  
  // Limit the number of players shown if there are many
  const playersToShow = useMemo(() => {
    if (showAllPlayers) return positionHistories;
    
    // Only show top players by default (players with lowest final position)
    return positionHistories
      .sort((a, b) => {
        const aLastPos = a.history[a.history.length - 1]?.position || 999;
        const bLastPos = b.history[b.history.length - 1]?.position || 999;
        return aLastPos - bLastPos;
      })
      .slice(0, 5);
  }, [positionHistories, showAllPlayers]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Position Tracking</CardTitle>
          <CardDescription>
            Loading position history...
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse w-full h-48 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!positionHistories.length) {
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 50, // Extra space for the avatars
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="matchNumber" 
                label={{ value: 'Match #', position: 'insideBottomRight', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                reversed // This makes position 1 at the top
                label={{ value: 'Position', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                domain={[1, 'dataMax']}
                allowDecimals={false}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const matchDate = payload[0]?.payload?.formattedDate || '';
                    return (
                      <div className="bg-background border border-border rounded-md p-2 shadow-md">
                        <p className="text-sm font-medium mb-1">Match #{label} - {matchDate}</p>
                        <div className="space-y-1">
                          {payload
                            .sort((a: any, b: any) => a.value - b.value)
                            .map((entry: any, index: number) => {
                              // Extract the player name from the data
                              const playerId = entry.dataKey;
                              const player = positionHistories.find(p => p.playerId === playerId);
                              return (
                                <div 
                                  key={`item-${index}`} 
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={player?.playerImage} alt={player?.playerName} />
                                    <AvatarFallback className="text-[8px]">
                                      {player?.playerImage ? player?.playerName.charAt(0) : <Ghost className="h-2 w-2" />}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{player?.playerName}</span>
                                  <span className="text-muted-foreground ml-auto">
                                    Position: {entry.value}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend content={() => null} /> {/* Hide the default legend */}
              
              {/* Draw a line for each player */}
              {playersToShow.map((player, index) => (
                <Line
                  key={player.playerId}
                  type="monotone"
                  dataKey={player.playerId}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={hoveredPlayerId === player.playerId ? 3 : 2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom legend with avatars */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {playersToShow.map((player, index) => {
            const lastPosition = player.history[player.history.length - 1]?.position;
            return (
              <div
                key={player.playerId}
                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  hoveredPlayerId === player.playerId ? 'bg-muted' : ''
                }`}
                onMouseEnter={() => setHoveredPlayerId(player.playerId)}
                onMouseLeave={() => setHoveredPlayerId(null)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <Avatar className="h-5 w-5">
                  <AvatarImage src={player.playerImage} alt={player.playerName} />
                  <AvatarFallback className="text-[10px]">
                    {player.playerImage ? player.playerName.charAt(0) : <Ghost className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs truncate flex-1">{player.playerName}</div>
                <div className="text-xs font-medium">#{lastPosition}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonPositionChart;
