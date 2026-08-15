"use client";

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

export default function RatingsPage() {
  const { currentTeam } = useTeam();
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const { ranked, all, isLoading } = usePlayerRatings();
  const byId = new Map(players.map((p) => [p.id, p]));

  // Five lines is the most that stays legible; beyond that it is a plate of
  // spaghetti. The top of the table is the interesting part anyway.
  const charted = ranked.slice(0, 5).flatMap((rating) => {
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
        <p className="mt-2 max-w-prose text-muted-foreground">
          Elo, adapted for five-a-side. A side is rated at the average of its
          players, everyone on it takes the same adjustment, and beating a
          stronger team is worth more than beating a weaker one. Margin counts,
          but a thrashing is capped — it is one team having a night, not
          {" "}{ELO.maxMarginMultiplier} times the evidence.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">The table</CardTitle>
            <CardDescription>
              {settling > 0
                ? `${settling} still settling — a rating counts once someone has played ${ELO.provisionalGames} games.`
                : "Everyone's rating has settled."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="sheen h-64 rounded-lg" />
            ) : (
              <RatingLeaderboard ratings={ranked} players={players} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top five over time</CardTitle>
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
