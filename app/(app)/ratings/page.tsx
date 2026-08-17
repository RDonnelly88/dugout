"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import RatingLeaderboard from "@/components/ratings/RatingLeaderboard";
import RatingHistoryChart from "@/components/ratings/RatingHistoryChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ELO } from "@/lib/config";
import ActiveFilter, {
  isActivePlayer,
  type ActiveScope,
} from "@/components/players/ActiveFilter";
import PageHeader from "@/components/PageHeader";
import RatingsGuide from "@/components/ratings/RatingsGuide";
import ChartPlayerPicker, { MAX_LINES } from "@/components/ratings/ChartPlayerPicker";

export default function RatingsPage() {
  const { currentTeam } = useTeam();
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const { ranked, all, isLoading } = usePlayerRatings();
  const [scope, setScope] = useState<ActiveScope>("active");
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  // A squad that has run for years carries people who stopped turning up, and
  // their last rating sits in the table for ever. Hidden by default, because
  // the question the table answers is who to pick on Tuesday.
  const shown = useMemo(
    () =>
      scope === "all"
        ? ranked
        : ranked.filter((rating) => {
            const player = byId.get(rating.playerId);
            return player ? isActivePlayer(player) : true;
          }),
    [ranked, scope, byId]
  );

  // The top of the table is a reasonable opening guess and rarely the
  // comparison anybody actually wants, so it is only the starting point.
  // Held as null until the table has loaded, or the default would stick as
  // an empty list picked before there was anybody to pick.
  const [chartedIds, setChartedIds] = useState<string[] | null>(null);
  const charted = useMemo(() => {
    const ids =
      chartedIds ?? shown.slice(0, MAX_LINES).map((rating) => rating.playerId);
    return ids.flatMap((playerId) => {
      const player = byId.get(playerId);
      const rating = all.find((entry) => entry.playerId === playerId);
      return player && rating ? [{ playerId, name: player.name, rating }] : [];
    });
  }, [chartedIds, shown, all, byId]);

  const rough = all.filter((r) => r.unsettled).length;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Ratings"
        actions={<RatingsGuide players={players} />}
        subtitle={
          <>
            Elo, adapted for five-a-side. A side is rated at the average of its
            players, everyone on it takes the same adjustment, and beating a
            stronger team is worth more than beating a weaker one. A win is a
            win — a thrashing counts the same as a scrape. Everybody has a
            rating from their first game, and one under {ELO.settledAfter} games
            is marked as a rough guess until there is enough behind it to lean
            on. Miss more than{" "}
            {ELO.decay.graceMatches} matches the rest of the squad played and it
            drifts back towards {ELO.start}; a break when nobody plays costs
            nothing.
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>The table</CardTitle>
                <CardDescription>
                  {rough > 0
                    ? `${rough} still a rough guess — those have under ${ELO.settledAfter} games behind them.`
                    : "Every rating has games enough behind it to lean on."}
                </CardDescription>
              </div>
              <ActiveFilter
                value={scope}
                onChange={setScope}
                counts={{
                  active: ranked.filter((r) => {
                    const player = byId.get(r.playerId);
                    return player ? isActivePlayer(player) : true;
                  }).length,
                  all: ranked.length,
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="sheen h-64 rounded-lg" />
            ) : (
              <RatingLeaderboard ratings={shown} players={players} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Over time</CardTitle>
            <CardDescription>
              Everyone starts at {ELO.start}. Tap a line to read the night.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChartPlayerPicker
              players={shown.flatMap((rating) => {
                const player = byId.get(rating.playerId);
                return player ? [player] : [];
              })}
              charted={charted.map((entry) => entry.playerId)}
              onChange={setChartedIds}
            />
            <RatingHistoryChart players={charted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
