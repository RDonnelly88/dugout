"use client";

import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useChartTheme } from "@/lib/useChartTheme";
import { displayRating, type PlayerRating } from "@/lib/elo";
import { ratingSeries, type SeriesPoint } from "@/lib/rating-series";
import { ELO } from "@/lib/config";

const SERIES_COLOURS = [
  "accent",
  "info",
  "win",
  "draw",
  "loss",
] as const;

/** What a point on the line was: a result and its swing, or a week away. */
function describe(point: SeriesPoint): string {
  const moved = Math.round(point.change);
  const swing = `${moved > 0 ? "+" : moved < 0 ? "−" : ""}${Math.abs(moved)}`;
  if (!point.played) return moved === 0 ? "didn't play" : `away ${swing}`;
  const word =
    point.result === "win" ? "won" : point.result === "draw" ? "drew" : "lost";
  return `${word} ${swing}`;
}

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
  const alone = players.length === 1;
  // Two of these can share a page — a player's own card and the table's chart
  // — and a gradient is addressed by id, so they cannot share one. Stripped of
  // anything that is not a name, since `url(#…)` is a CSS reference and a
  // generated id is only promised to be unique.
  const fillId = `rating-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Recharts wants one row per x value with a key per series, so the per-player
  // histories are pivoted onto a shared date axis. A player who missed a week
  // has no point there, and `connectNulls` carries the line across the gap
  // rather than breaking it.
  const { data, detail } = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    // What happened to each player on each date, for the tooltip. The line
    // itself only needs a number; the reason for it lives here.
    const detail = new Map<string, Map<string, SeriesPoint>>();

    for (const { playerId, rating } of players) {
      // The matches they played and the ones they missed, on one line.
      // Without the second half a line stopped at whenever somebody last
      // turned out, which read as a rating holding steady when it had been
      // drifting for weeks.
      for (const point of ratingSeries(rating)) {
        const row = byDate.get(point.date) ?? { date: point.date };
        row[playerId] = displayRating(point.rating);
        byDate.set(point.date, row);

        const forDate = detail.get(point.date) ?? new Map<string, SeriesPoint>();
        forDate.set(playerId, point);
        detail.set(point.date, forDate);
      }
    }

    return {
      data: [...byDate.values()].sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
      ),
      detail,
    };
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
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          {/* One line gets the ground beneath it filled, which reads as a
              shape rather than a squiggle. Five lines do not: five washes
              over one another and the only thing anybody can see is the
              overlap. */}
          {alone && (
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.accent} stopOpacity={0.28} />
                <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
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
          {/* Click, not hover. There is no hovering on a phone, and the
              point of a point is worth reading there most of all — it stays
              up until the next tap rather than flickering past. */}
          <Tooltip
            trigger="click"
            cursor={{ stroke: theme.border }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const forDate = detail.get(String(label));
              return (
                <div
                  className="rounded-lg border border-border bg-surface p-2 text-xs shadow-lg"
                  style={{ color: theme.foreground }}
                >
                  <p className="mb-1 font-medium">
                    {format(parseISO(String(label)), "d MMM yyyy")}
                  </p>
                  <ul className="space-y-0.5">
                    {payload.map((series) => {
                      const point = forDate?.get(String(series.dataKey));
                      return (
                        <li
                          key={String(series.dataKey)}
                          className="flex items-baseline gap-2"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: series.color }}
                          />
                          <span className="flex-1">{series.name}</span>
                          <span className="tabular font-medium">
                            {series.value}
                          </span>
                          {point && (
                            <span className="tabular text-muted-foreground">
                              {describe(point)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }}
          />
          {alone && (
            <Area
              type="monotone"
              dataKey={players[0].playerId}
              // The line on top of it draws the stroke; this is the ground.
              stroke="none"
              fill={`url(#${fillId})`}
              connectNulls
              isAnimationActive={false}
              // Recharts would otherwise put this in the legend and the
              // tooltip as a second reading of the same rating.
              legendType="none"
              tooltipType="none"
            />
          )}
          {players.map(({ playerId, name }, i) => (
            <Line
              key={playerId}
              type="monotone"
              dataKey={playerId}
              name={name}
              stroke={theme[SERIES_COLOURS[i % SERIES_COLOURS.length]]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
