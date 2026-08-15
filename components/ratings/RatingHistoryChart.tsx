"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useChartTheme } from "@/lib/useChartTheme";
import { displayRating, type PlayerRating } from "@/lib/elo";
import { ELO } from "@/lib/config";

const SERIES_COLOURS = [
  "accent",
  "info",
  "win",
  "draw",
  "loss",
] as const;

/**
 * Ratings over time.
 *
 * The starting rating is drawn as a reference line, because a rating means
 * nothing on its own — the only question anyone asks is whether they are above
 * or below where everybody began.
 */
export default function RatingHistoryChart({
  players,
  height = 320,
}: {
  players: { playerId: string; name: string; rating: PlayerRating }[];
  height?: number;
}) {
  const theme = useChartTheme();

  // Recharts wants one row per x value with a key per series, so the per-player
  // histories are pivoted onto a shared date axis. A player who missed a week
  // has no point there, and `connectNulls` carries the line across the gap
  // rather than breaking it.
  const data = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();

    for (const { playerId, rating } of players) {
      for (const point of rating.history) {
        const row = byDate.get(point.date) ?? { date: point.date };
        row[playerId] = displayRating(point.rating);
        byDate.set(point.date, row);
      }
    }

    return [...byDate.values()].sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [players]);

  if (data.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Ratings appear once a few results are in.
      </p>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => format(parseISO(d), "d MMM")}
            tick={{ fontSize: 11, fill: theme["muted-foreground"] }}
            stroke={theme.border}
            minTickGap={28}
          />
          <YAxis
            domain={["dataMin - 30", "dataMax + 30"]}
            tick={{ fontSize: 11, fill: theme["muted-foreground"] }}
            stroke={theme.border}
            width={48}
          />
          <ReferenceLine
            y={ELO.start}
            stroke={theme["muted-foreground"]}
            strokeDasharray="4 4"
            label={{
              value: "start",
              position: "insideTopLeft",
              fontSize: 10,
              fill: theme["muted-foreground"],
            }}
          />
          <Tooltip
            contentStyle={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              fontSize: 12,
              color: theme.foreground,
            }}
            labelFormatter={(d) => format(parseISO(String(d)), "d MMM yyyy")}
          />
          {players.map(({ playerId, name }, i) => (
            <Line
              key={playerId}
              type="monotone"
              dataKey={playerId}
              name={name}
              stroke={theme[SERIES_COLOURS[i % SERIES_COLOURS.length]]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
