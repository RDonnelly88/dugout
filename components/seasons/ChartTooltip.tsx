import React from "react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import type { ChartLine } from "./PositionLineChart";

interface ChartTooltipProps {
  active?: boolean;
  /** Recharts hands this over readonly — it is the chart's own array. */
  payload?: readonly { dataKey?: unknown; value?: unknown; payload?: { date?: string } }[];
  label?: unknown;
  lines: ChartLine[];
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, lines }) => {
  if (!active || !payload?.length) return null;

  const date = payload[0]?.payload?.date ?? "";
  const rows = payload
    .filter((entry) => typeof entry.value === "number")
    .map((entry) => ({
      line: lines.find((l) => l.playerId === entry.dataKey),
      position: entry.value as number,
    }))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md">
      <p className="mb-1 text-sm font-medium">
        Match {String(label)} · {date}
      </p>
      <ul className="space-y-1">
        {rows.map(({ line, position }) =>
          line ? (
            <li key={line.playerId} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: line.colour }}
              />
              <PlayerAvatar name={line.player?.name ?? "Unknown"} image={line.player?.image} size="xs" />
              <span className="font-medium">{line.player?.name ?? "Unknown"}</span>
              <span className="tabular ml-auto pl-3 text-muted-foreground">#{position}</span>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default ChartTooltip;
