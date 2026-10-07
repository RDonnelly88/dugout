"use client";

import TransitionLink from "@/components/TransitionLink";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";
import ResultStrip from "@/components/players/ResultStrip";
import { useRecentResults } from "@/hooks/useRecentResults";
import { MEDAL } from "@/lib/podium";
import { calculatePlayerRanks, sortPlayersByRank } from "@/lib/ranking-utils";
import { cn } from "@/lib/utils";
import type { SeasonPlayerStats } from "@/types";

/**
 * A season's table, built for a phone first: every column a table needs —
 * played, won, drawn, lost, points — on one row at 360 pixels, with the
 * name and the last five stacked in the room that is left rather than the
 * last three columns hidden to make space for a badge.
 *
 * Ranks come from `calculatePlayerRanks`, the one set of rules in the app,
 * so a shared place is shared here as it is on the podium and the chart.
 */
export default function LeagueTable({
  stats,
  seasonId,
  limit,
  highlight,
}: {
  stats: SeasonPlayerStats[];
  seasonId?: string;
  /** Only the top of it, for a glance. */
  limit?: number;
  /** A player whose row is lit, wherever they are in it. */
  highlight?: string;
}) {
  const { resultsFor } = useRecentResults(seasonId);
  const played = stats.filter((s) => s.played > 0);
  const ranks = calculatePlayerRanks(played);
  const rows = sortPlayersByRank(played);
  const shown = limit ? rows.slice(0, limit) : rows;

  if (played.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nobody has played yet.</p>;
  }

  const head = "px-1 pb-2 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          <th className={cn(head, "w-7 text-left")}>#</th>
          <th className={cn(head, "text-left")}>Player</th>
          <th className={cn(head, "w-7")} title="Played">P</th>
          <th className={cn(head, "w-7")} title="Won">W</th>
          <th className={cn(head, "w-7")} title="Drawn">D</th>
          <th className={cn(head, "w-7")} title="Lost">L</th>
          <th className={cn(head, "w-10 pr-0")} title="Points">Pts</th>
        </tr>
      </thead>
      <tbody>
        {shown.map((row) => {
          const rank = ranks[row.playerId];
          const lit = row.playerId === highlight;
          const cell = cn("border-t border-border px-1 py-2.5 text-right tabular", lit && "bg-accent/10");
          return (
            <tr key={row.playerId}>
              <td className={cn(cell, "text-left font-semibold", rank <= 3 ? MEDAL[rank - 1].text : "text-muted-foreground")}>
                {rank}
              </td>
              <td className={cn(cell, "text-left")}>
                <TransitionLink
                  href={`/players/${row.playerId}`}
                  shareAvatar
                  className="focus-ring flex min-w-0 items-center gap-2 rounded"
                >
                  {/* A face where there is room for one; on a phone the name
                      needs the width more. */}
                  <PlayerAvatar name={row.playerName} image={row.playerImage} size="xs" className="hidden sm:inline-flex" />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-1.5 font-medium leading-tight">
                      {row.playerName}
                      <PlayerSeasonStars playerId={row.playerId} size="sm" />
                    </span>
                    <span className="mt-1 block">
                      <ResultStrip results={resultsFor(row.playerId)} size="xs" />
                    </span>
                  </span>
                </TransitionLink>
              </td>
              <td className={cell}>{row.played}</td>
              <td className={cn(cell, "text-win")}>{row.wins}</td>
              <td className={cn(cell, "text-draw")}>{row.draws}</td>
              <td className={cn(cell, "text-loss")}>{row.losses}</td>
              <td className={cn(cell, "pr-0 text-base font-bold")}>{row.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
