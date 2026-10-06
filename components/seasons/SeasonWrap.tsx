"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { seasonWrap } from "@/lib/season-wrap";
import { seasonNights } from "@/lib/season-story";
import { signedWins } from "@/lib/expected-wins";
import { displayRating } from "@/lib/elo";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import Stamp from "@/components/ui/stamp";
import SeasonNights from "@/components/seasons/SeasonNights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Match, Player } from "@/types";

const pct = (x: number) => `${Math.round(x * 100)}%`;

function Award({
  icon: Icon,
  title,
  stamp,
  children,
  index,
  href,
}: {
  icon: typeof Flame;
  title: string;
  /** A word or a figure stamped in the corner. Repeats what the card says. */
  stamp: string;
  children: React.ReactNode;
  index: number;
  /** Where the award leads, for the one that is about a single night. */
  href?: string;
}) {
  const reduced = useReducedMotion();

  const card = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="eyebrow flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-accent" />
          {title}
        </h4>
        {/* Alternate leans, so a grid of them looks stamped by hand. */}
        <Stamp tilt={index % 2 === 0 ? -6 : 5} className="shrink-0 text-[10px]">
          {stamp}
        </Stamp>
      </div>
      {children}
    </>
  );

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : index * 0.08 }}
      className="rounded-xl border border-border bg-surface/70"
    >
      {href ? (
        <Link
          href={href}
          className="focus-ring block h-full rounded-xl p-4 transition-colors hover:border-border-strong hover:bg-surface-2/70"
        >
          {card}
        </Link>
      ) : (
        <div className="p-4">{card}</div>
      )}
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
  finished = false,
}: {
  /** The matches this season, which is what the awards are about. */
  season: Match[];
  players: Player[];
  /** Whether the last night was the final one or only the latest. */
  finished?: boolean;
}) {
  const { currentTeam } = useTeam();
  const { data: history = [], isPending } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const wrap = useMemo(() => seasonWrap(history, season), [history, season]);
  const nights = useMemo(
    () => seasonNights(season, { upsetMatchId: wrap.upset?.matchId, finished }),
    [season, wrap.upset?.matchId, finished]
  );
  const byId = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );

  const awards = [
    wrap.climber && {
      icon: TrendingUp,
      title: "Most improved",
      stamp: `+${Math.round(wrap.climber.change)}`,
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
      stamp: `${wrap.streak.length} in a row`,
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
      stamp: "Partners",
      // Into the line-up lab, where the pair can be taken apart.
      href: `/lineups?p=${wrap.partnership.playerIds.join(",")}`,
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
              {signedWins(wrap.partnership.above)} wins above xW over{" "}
              {wrap.partnership.played} games together
            </p>
          </div>
        </div>
      ),
    },
    wrap.everPresent && {
      icon: Zap,
      title: "Never missed",
      stamp: pct(wrap.everPresent.share),
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
      stamp: wrap.upset.expected < 0.5 ? "Upset" : "Close call",
      // The one award that names a single night, so it is the one worth
      // being a way into that night.
      href: `/matches/${wrap.upset.matchId}`,
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
          {/* Above an even chance the winners were the favourites, so there
              was no upset all season and saying there was would be inventing
              one. The award still names the result the table came closest to
              getting wrong. */}
          <p className="text-xs text-muted-foreground">
            {wrap.upset.expected < 0.5 ? (
              <>
                {wrap.upset.drawn ? "Held" : "Beat"} a side the table gave them{" "}
                <span className="tabular">{pct(wrap.upset.expected)}</span>{" "}
                against
              </>
            ) : (
              <>
                The closest the table came to being wrong, and it still had
                them at <span className="tabular">{pct(wrap.upset.expected)}</span>
              </>
            )}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-accent">
            See the match
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      ),
    },
  ].filter(Boolean) as {
    icon: typeof Flame;
    title: string;
    stamp: string;
    body: React.ReactNode;
    href?: string;
  }[];

  // Half the awards need the ratings, so showing the other half first would
  // have the card grow an award a moment after it appeared.
  if (isPending || awards.length === 0) return null;

  return (
    // Printed, like the programme a club would hand out at the last game.
    <Card className="grain overflow-hidden">
      <CardHeader>
        <p className="eyebrow">
          Season review · {wrap.matches} {wrap.matches === 1 ? "night" : "nights"}
        </p>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          How the season went
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <section aria-labelledby="season-nights">
          <h3 id="season-nights" className="eyebrow mb-4">
            The nights that made it
          </h3>
          <SeasonNights nights={nights} />
        </section>

        <section aria-labelledby="season-awards">
          <h3 id="season-awards" className="eyebrow mb-3">
            The awards
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {awards.map((award, i) => (
              <Award
                key={award.title}
                icon={award.icon}
                title={award.title}
                stamp={award.stamp}
                index={i}
                href={award.href}
              >
                {award.body}
              </Award>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
