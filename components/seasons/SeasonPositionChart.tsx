import React, { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSeasonPositions } from "@/hooks/useSeasonPositions";
import { useChartTheme } from "@/lib/useChartTheme";
import ChartLoadingState from "./ChartLoadingState";
import ChartEmptyState from "./ChartEmptyState";
import PositionLineChart, { type ChartLine } from "./PositionLineChart";
import PlayerLegend from "./PlayerLegend";

/** How many lines to draw before asking: more than this is a tangle. */
const SHOWN = 5;

interface SeasonPositionChartProps {
  seasonId: string;
  seasonName?: string;
}

/** Dates arrive as either a plain day or a full timestamp. */
const day = (value: string) =>
  value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`);

/**
 * Where everybody stood in the table after each match of the season.
 *
 * Built from the same matches and the same ranking rules as the table above
 * it, so the last point on every line is the place in that table.
 */
const SeasonPositionChart: React.FC<SeasonPositionChartProps> = ({ seasonId, seasonName }) => {
  const { matches, lines, isLoading } = useSeasonPositions(seasonId);
  const theme = useChartTheme();
  const [showAll, setShowAll] = useState(false);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  // A colour per player for the whole season, fixed by where they finish, so
  // nobody changes colour when the rest of the squad is shown.
  const all: ChartLine[] = useMemo(
    () =>
      lines.map((line, i) => ({
        ...line,
        colour: theme.series[i % theme.series.length],
        dashed: i >= theme.series.length,
      })),
    [lines, theme]
  );
  const shown = showAll ? all : all.slice(0, SHOWN);

  const chartData = useMemo(
    () =>
      matches.map((match, i) => ({
        step: i + 1,
        date: format(day(match.date), "d MMM"),
        ...Object.fromEntries(lines.map((line) => [line.playerId, line.positions[i]])),
      })),
    [matches, lines]
  );

  if (isLoading) return <ChartLoadingState seasonName={seasonName} />;
  if (matches.length === 0) return <ChartEmptyState seasonName={seasonName} />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Position after each match</CardTitle>
            <CardDescription>
              Where everybody stood in {seasonName ?? "the table"} as each result came in.
            </CardDescription>
          </div>
          {all.length > SHOWN && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll((value) => !value)}
              className="shrink-0 text-xs"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Top five
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Everyone
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 h-80">
          <PositionLineChart
            data={chartData}
            lines={shown}
            hoveredPlayerId={hoveredPlayerId}
            theme={theme}
          />
        </div>
        <PlayerLegend
          lines={shown}
          hoveredPlayerId={hoveredPlayerId}
          setHoveredPlayerId={setHoveredPlayerId}
        />
      </CardContent>
    </Card>
  );
};

export default SeasonPositionChart;
