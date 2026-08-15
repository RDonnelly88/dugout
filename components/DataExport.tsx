"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { getMatches, getPlayers } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { displayRating } from "@/lib/elo";
import { winRate } from "@/lib/player-stats";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Take the data out.
 *
 * It is a record of several seasons of somebody's Thursday nights, and it
 * should never be locked inside one deployment of one app. A spreadsheet is
 * the format everyone already has.
 */
export default function DataExport() {
  const { currentTeam } = useTeam();
  const sides = useSideNames();
  const [done, setDone] = useState<string | null>(null);

  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const { recordFor } = usePlayerRecords();
  const { ratingFor } = usePlayerRatings();

  const stamp = format(new Date(), "yyyy-MM-dd");
  const slug = (currentTeam?.name ?? "dugout")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const exportPlayers = () => {
    const csv = toCsv(players, [
      { header: "Player", value: (p) => p.name },
      { header: "Played", value: (p) => recordFor(p.id, p.name).played },
      { header: "Won", value: (p) => recordFor(p.id, p.name).wins },
      { header: "Drawn", value: (p) => recordFor(p.id, p.name).draws },
      { header: "Lost", value: (p) => recordFor(p.id, p.name).losses },
      { header: "Points", value: (p) => recordFor(p.id, p.name).points },
      {
        header: "Win rate",
        value: (p) => `${Math.round(winRate(recordFor(p.id, p.name)) * 100)}%`,
      },
      {
        header: "Rating",
        value: (p) => {
          const rating = ratingFor(p.id);
          return rating ? displayRating(rating.rating) : "";
        },
      },
      { header: "Active", value: (p) => (p.isActive === false ? "no" : "yes") },
    ]);
    downloadCsv(`${slug}-players-${stamp}.csv`, csv);
    setDone("Players exported.");
  };

  const exportMatches = () => {
    const byId = new Map(players.map((p) => [p.id, p.name]));
    const names = (ids: string[]) =>
      ids.map((id) => byId.get(id) ?? id).join(" · ");

    // The team's current names for its sides, not the one stored on the match
    // — everything played before the names were configurable carries "Team A",
    // and a column headed with it would not match anything on screen.
    const csv = toCsv(matches, [
      { header: "Date", value: (m) => m.date },
      { header: "Status", value: (m) => m.status },
      { header: "Result", value: (m) => outcomeOf(m) ?? "" },
      { header: sides.A, value: (m) => names(m.teamA?.players ?? []) },
      { header: `${sides.A} score`, value: (m) => m.teamA?.score ?? "" },
      { header: sides.B, value: (m) => names(m.teamB?.players ?? []) },
      { header: `${sides.B} score`, value: (m) => m.teamB?.score ?? "" },
      { header: "Notes", value: (m) => m.notes ?? "" },
    ]);
    downloadCsv(`${slug}-matches-${stamp}.csv`, csv);
    setDone("Matches exported.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-accent" />
          Export
        </CardTitle>
        <CardDescription>
          Take your results with you. Opens in any spreadsheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={exportPlayers} disabled={!players.length}>
          Players and ratings
        </Button>
        <Button variant="outline" onClick={exportMatches} disabled={!matches.length}>
          Every match
        </Button>
        {done && <output className="text-sm text-accent">{done}</output>}
      </CardContent>
    </Card>
  );
}
