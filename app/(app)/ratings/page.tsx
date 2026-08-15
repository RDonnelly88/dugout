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

  // Five lines is the most that stays legible; beyond that it is a plate of
  // spaghetti. The top of the table is the interesting part anyway.
  const charted = shown.slice(0, 5).flatMap((rating) => {
    const player = byId.get(rating.playerId);
    return player
      ? [{ playerId: rating.playerId, name: player.name, rating }]
      : [];
  });

  const settling = all.filter((r) => r.provisional).length;

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Ratings</h1>
        <p className="page-subtitle">
          Elo, adapted for five-a-side. A side is rated at the average of its
          players, everyone on it takes the same adjustment, and beating a
          stronger team is worth more than beating a weaker one. Margin counts,
          but a thrashing is capped — it is one team having a night, not
          {" "}{ELO.maxMarginMultiplier} times the evidence. Stay away longer than{" "}
          {ELO.decay.graceWeeks} weeks and your rating drifts back towards{" "}
          {ELO.start}, so every week is comparable to the last.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>The table</CardTitle>
                <CardDescription>
                  {settling > 0
                    ? `${settling} still settling — a rating counts once someone has played ${ELO.provisionalGames} games.`
                    : "Everyone's rating has settled."}
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
            <CardTitle>Top five over time</CardTitle>
            <CardDescription>
              Everyone starts at {ELO.start}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RatingHistoryChart players={charted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
