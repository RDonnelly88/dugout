"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Flame, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { seasonWrap } from "@/lib/season-wrap";
import { displayRating } from "@/lib/elo";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Match, Player } from "@/types";

const pct = (x: number) => `${Math.round(x * 100)}%`;

function Award({
  icon: Icon,
  title,
  children,
  index,
}: {
  icon: typeof Flame;
  title: string;
  children: React.ReactNode;
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : index * 0.08 }}
      className="rounded-xl border border-border bg-surface-2/40 p-4"
    >
      <h4 className="eyebrow mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {title}
      </h4>
      {children}
    </motion.div>
  );
}

function Named({
  player,
  detail,
}: {
  player: Player | undefined;
  detail: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <PlayerAvatar name={player?.name ?? "Unknown"} image={player?.image} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-semibold">{player?.name ?? "Unknown"}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

/**
 * What a season turned out to be about.
 *
 * Every award is read off the matches rather than decided and stored, like
 * the rest of the app — the same season replayed gives the same answers, and
 * correcting a scoreline from March changes them, which is right.
 *
 * Nothing is shown that the season cannot support: a squad three games in has
 * no most-improved player and no partnership, and says so by leaving them
 * out rather than crowning somebody on one good night.
 *
 * The whole match history is fetched alongside the season's own, because a
 * rating is not reset in January: a player walks into a season carrying what
 * they earned in the last one, and the climb is measured from that. It is the
 * same query the rest of the app reads, so it costs nothing to ask for.
 */
export default function SeasonWrap({
  season,
  players,
}: {
  /** The matches this season, which is what the awards are about. */
  season: Match[];
  players: Player[];
}) {
  const { currentTeam } = useTeam();
  const { data: history = [], isPending } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const wrap = useMemo(() => seasonWrap(history, season), [history, season]);
  const byId = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );

  const awards = [
    wrap.climber && {
      icon: TrendingUp,
      title: "Most improved",
      body: (
        <Named
          player={byId.get(wrap.climber.playerId)}
          detail={`Up ${Math.round(wrap.climber.change)} across the season, ${displayRating(
            wrap.climber.from
          )} to ${displayRating(wrap.climber.to)}`}
        />
      ),
    },
    wrap.streak && {
      icon: Flame,
      title: "Longest run",
      body: (
        <Named
          player={byId.get(wrap.streak.playerId)}
          detail={`${wrap.streak.length} wins on the bounce`}
        />
      ),
    },
    wrap.partnership && {
      icon: Users,
      title: "Best pair",
      body: (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {wrap.partnership.playerIds.map((id) => (
              <PlayerAvatar
                key={id}
                name={byId.get(id)?.name ?? "Unknown"}
                image={byId.get(id)?.image}
                size="sm"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {wrap.partnership.playerIds
                .map((id) => byId.get(id)?.name ?? "Unknown")
                .join(" & ")}
            </p>
            <p className="text-xs text-muted-foreground">
              {pct(wrap.partnership.lift)} together over{" "}
              {wrap.partnership.played} games
            </p>
          </div>
        </div>
      ),
    },
    wrap.everPresent && {
      icon: Zap,
      title: "Never missed",
      body: (
        <Named
          player={byId.get(wrap.everPresent.playerId)}
          detail={`${wrap.everPresent.played} of ${wrap.matches} nights, ${pct(
            wrap.everPresent.share
          )}`}
        />
      ),
    },
    wrap.upset && {
      icon: Sparkles,
      title: "Result of the season",
      body: (
        <div>
          <div className="mb-1 flex -space-x-2">
            {wrap.upset.winnerIds.slice(0, 6).map((id) => (
              <PlayerAvatar
                key={id}
                name={byId.get(id)?.name ?? "Unknown"}
                image={byId.get(id)?.image}
                size="xs"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {wrap.upset.drawn ? "Held" : "Beat"} a side the table gave them{" "}
            <span className="tabular">{pct(wrap.upset.expected)}</span> against
          </p>
        </div>
      ),
    },
  ].filter(Boolean) as {
    icon: typeof Flame;
    title: string;
    body: React.ReactNode;
  }[];

  // Half the awards need the ratings, so showing the other half first would
  // have the card grow an award a moment after it appeared.
  if (isPending || awards.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          How the season went
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {awards.map((award, i) => (
            <Award key={award.title} icon={award.icon} title={award.title} index={i}>
              {award.body}
            </Award>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
