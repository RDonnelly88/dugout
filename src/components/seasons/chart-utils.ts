
import { format, parseISO } from "date-fns";
import { PlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";

// Custom colors for the lines
export const CHART_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", 
  "#118AB2", "#073B4C", "#EF476F", "#FFC43D", 
  "#1B9AAA", "#6A0572", "#AB83A1", "#F15BB5", 
  "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"
];

// Helper function to format the date
export const formatDate = (dateString: string) => {
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

// Helper function to prepare chart data
export const prepareChartData = (positionHistories: PlayerPositionHistory[]) => {
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
};

// Filter the players to show based on settings
export const getPlayersToShow = (
  positionHistories: PlayerPositionHistory[], 
  showAllPlayers: boolean
) => {
  if (showAllPlayers) return positionHistories;
  
  // Only show top players by default (players with lowest final position)
  return positionHistories
    .sort((a, b) => {
      const aLastPos = a.history[a.history.length - 1]?.position || 999;
      const bLastPos = b.history[b.history.length - 1]?.position || 999;
      return aLastPos - bLastPos;
    })
    .slice(0, 5);
};
