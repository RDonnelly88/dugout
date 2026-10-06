import React from "react";
import { useReducedMotion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PositionLine } from "@/hooks/useSeasonPositions";
import type { ChartTheme } from "@/lib/useChartTheme";
import ChartTooltip from "./ChartTooltip";

export interface ChartLine extends PositionLine {
  colour: string;
  /** Past the end of the palette: the colour comes round again, dashed. */
  dashed: boolean;
}

interface PositionLineChartProps {
  data: Record<string, string | number | null>[];
  lines: ChartLine[];
  hoveredPlayerId: string | null;
  theme: ChartTheme;
}

const PositionLineChart: React.FC<PositionLineChartProps> = ({
  data,
  lines,
  hoveredPlayerId,
  theme,
}) => {
  const reduced = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -16 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="step"
          tick={{ fontSize: 11, fill: theme["muted-foreground"] }}
          stroke={theme.border}
        />
        <YAxis
          // First place at the top.
          reversed
          domain={[1, "dataMax"]}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: theme["muted-foreground"] }}
          stroke={theme.border}
        />
        <RechartsTooltip
          cursor={{ stroke: theme.border }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} lines={lines} />
          )}
        />
        {lines.map((line) => (
          <Line
            key={line.playerId}
            type="monotone"
            dataKey={line.playerId}
            stroke={line.colour}
            strokeDasharray={line.dashed ? "5 4" : undefined}
            strokeWidth={hoveredPlayerId === line.playerId ? 3.5 : 2}
            strokeOpacity={hoveredPlayerId && hoveredPlayerId !== line.playerId ? 0.25 : 1}
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls={false}
            isAnimationActive={!reduced}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PositionLineChart;
