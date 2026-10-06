import React from "react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { ChartLine } from "./PositionLineChart";

interface PlayerLegendProps {
  lines: ChartLine[];
  hoveredPlayerId: string | null;
  setHoveredPlayerId: (id: string | null) => void;
}

const PlayerLegend: React.FC<PlayerLegendProps> = ({
  lines,
  hoveredPlayerId,
  setHoveredPlayerId,
}) => (
  <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
    {lines.map((line) => {
      const last = line.positions[line.positions.length - 1];
      const name = line.player?.name ?? "Unknown";
      return (
        <li key={line.playerId}>
          {/* A button so the highlight can be reached from the keyboard too:
              focusing a name lights its line the way hovering does. */}
          <button
            type="button"
            aria-pressed={hoveredPlayerId === line.playerId}
            className={cn(
              "focus-ring flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors",
              hoveredPlayerId === line.playerId && "bg-muted"
            )}
            onMouseEnter={() => setHoveredPlayerId(line.playerId)}
            onMouseLeave={() => setHoveredPlayerId(null)}
            onFocus={() => setHoveredPlayerId(line.playerId)}
            onBlur={() => setHoveredPlayerId(null)}
          >
          {/* The line's own stroke, dashes and all, so a repeated colour still
              says which line it is. */}
          <svg aria-hidden className="h-2 w-4 shrink-0" viewBox="0 0 16 8">
            <line
              x1="0"
              y1="4"
              x2="16"
              y2="4"
              stroke={line.colour}
              strokeWidth="3"
              strokeDasharray={line.dashed ? "5 3" : undefined}
            />
          </svg>
          <PlayerAvatar name={name} image={line.player?.image} size="xs" />
          <span className="flex-1 truncate text-xs">{name}</span>
          {last !== null && last !== undefined && (
            <span className="tabular text-xs font-medium">#{last}</span>
          )}
          </button>
        </li>
      );
    })}
  </ul>
);

export default PlayerLegend;
