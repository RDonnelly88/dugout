
import React from "react";
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
import { PlayerPositionHistory } from "@/hooks/usePlayerPositionHistory";
import { CHART_COLORS } from "./chart-utils";
import ChartTooltip from "./ChartTooltip";

interface PositionLineChartProps {
  chartData: any[];
  players: PlayerPositionHistory[];
  hoveredPlayerId: string | null;
}

const PositionLineChart: React.FC<PositionLineChartProps> = ({ 
  chartData, 
  players, 
  hoveredPlayerId 
}) => {
  return (
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
          content={({ active, payload, label }) => (
            <ChartTooltip 
              active={active} 
              payload={payload} 
              label={label}
              positionHistories={players} 
            />
          )}
        />
        <Legend content={() => null} /> {/* Hide the default legend */}
        
        {/* Draw a line for each player */}
        {players.map((player, index) => (
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
  );
};

export default PositionLineChart;
