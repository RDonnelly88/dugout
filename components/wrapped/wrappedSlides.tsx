import Link from "next/link";
import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import RollingNumber from "@/components/RollingNumber";
import Stamp from "@/components/ui/stamp";
import LuckBar from "@/components/xw/LuckBar";
import Verdict from "@/components/xw/Verdict";
import ShareImageButton from "@/components/ShareImageButton";
import { displayRating } from "@/lib/elo";
import { signedWins } from "@/lib/expected-wins";
import { pointsPerGame, ppg } from "@/lib/measure";
import type { Wrapped } from "@/lib/season-wrapped";
import { cn } from "@/lib/utils";
import type { Player, Season, SeasonPlayerStats } from "@/types";
import type { Slide } from "./WrappedStory";
import PlayerWeb from "./PlayerWeb";
import type { PointValues } from "@/lib/season-positions";

/**
 * The small tracked-out label at the top of a card. Not `.eyebrow`, which is
 * fixed to the muted grey and would vanish on the grass; this one takes the
 * card's own colour.
 */
const LABEL = "font-mono text-[11px] font-medium uppercase tracking-[0.18em] opacity-80";
const HEADLINE = "text-4xl font-extrabold leading-[1.05] [font-stretch:80%] sm:text-5xl";
const BODY = "text-base leading-relaxed opacity-90";

/** Dates arrive as either a plain day or a full timestamp. */
const day = (value: string) =>
  format(value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`), "d MMMM");

const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};

const isSet = (position: number | null | undefined): position is number =>
  typeof position === "number";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <p className={LABEL}>{label}</p>
      {children}
    </div>
  );
}

/** Where they stood after each night, drawn as a line: first at the top. */
function Journey({ positions, of }: { positions: (number | null)[]; of: number }) {
  const width = 300;
  const height = 140;
  const steps = Math.max(positions.length - 1, 1);
  const y = (position: number) => (of <= 1 ? 0 : ((position - 1) / (of - 1)) * height);
  const points = positions
    .map((position, i) => (isSet(position) ? `${(i / steps) * width},${y(position)}` : null))
    .filter(Boolean)
    .join(" ");
  const last = positions.at(-1);

  return (
    <svg
      viewBox={`-8 -30 ${width + 16} ${height + 64}`}
      className="w-full overflow-visible"
      aria-hidden
    >
      <line x1={0} x2={width} y1={0} y2={0} className="stroke-border-strong" strokeDasharray="4 4" />
      <line x1={0} x2={width} y1={height} y2={height} className="stroke-border-strong" strokeDasharray="4 4" />
      {/* Top and bottom of the table, so the line has a scale to read. */}
      <text x={0} y={-16} className="fill-muted-foreground font-mono text-[11px]">
        1st
      </text>
      <text x={0} y={height + 24} className="fill-muted-foreground font-mono text-[11px]">
        {ordinal(of)}
      </text>
      <polyline
        points={points}
        fill="none"
        className="stroke-accent"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {isSet(last) && <circle cx={width} cy={y(last)} r={7} className="fill-accent" />}
    </svg>
  );
}

function Tile({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/85 p-3">
      <div className={cn("scoreboard text-3xl", tone)}>{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/**
 * The cards of one player's season, leaving out any with nothing to say: no
 * upset card for somebody who never won as the underdog, no nemesis for
 * somebody nobody got the better of.
 */
export function wrappedSlides({
  story,
  player,
  season,
  row,
  playerFor,
  values,
}: {
  story: Wrapped;
  /** What a win and a draw were worth this season, for points a game. */
  values: PointValues | null;
  player: Player;
  season: Season;
  /** Their line of the season's table, which owns the points. */
  row: SeasonPlayerStats | undefined;
  playerFor: (id: string) => Player | undefined;
}): Slide[] {
  const name = player.name;
  const first = name.split(/\s+/)[0];
  const sofar = !season.isFinished;
  const { record } = story;
  const ownPpg = values ? pointsPerGame(record, values) : 0;
  const slides: Slide[] = [];

  slides.push({
    key: "cover",
    label: `${name}'s ${season.name}`,
    tone: "pitch",
    content: (
      <div className="flex flex-col items-center gap-5 text-center">
        <p className={LABEL}>
          {season.name} · wrapped{sofar ? " so far" : ""}
        </p>
        <PlayerAvatar name={name} image={player.image} size="xl" className="ring-4 ring-chalk/40" />
        <h1 className={HEADLINE}>{name}</h1>
        <p className={BODY}>
          Turned out for {story.record.played} of the squad&apos;s {story.nights} nights.
        </p>
      </div>
    ),
  });

  slides.push({
    key: "record",
    label: "The record",
    tone: "sheet",
    content: (
      <Card label="The record">
        <div className="scoreboard flex items-baseline gap-3 text-7xl">
          <span className="text-win">{record.wins}</span>
          <span className="text-4xl text-muted-foreground">–</span>
          <span className="text-draw">{record.draws}</span>
          <span className="text-4xl text-muted-foreground">–</span>
          <span className="text-loss">{record.losses}</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Won · drawn · lost
        </p>
        {story.place && (
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold">
              {ordinal(story.place.position)} of {story.place.of}
              {sofar ? " so far" : ""}
            </p>
            {story.place.position === 1 && (
              <Stamp ink="win" tilt={-7}>
                {sofar ? "Top" : "Champion"}
              </Stamp>
            )}
          </div>
        )}
        {row && (
          <p className={BODY}>
            {plural(row.points, "point")}
            {values && `, ${ppg(ownPpg)} a game`}, winning{" "}
            {Math.round((record.wins / Math.max(1, record.played)) * 100)}% of their games.
          </p>
        )}
      </Card>
    ),
  });

  if (story.place && story.journey.filter(isSet).length > 1) {
    const best = story.bestPlace!;
    slides.push({
      key: "journey",
      label: "The table",
      tone: "plain",
      content: (
        <Card label="Up and down the table">
          <h2 className={HEADLINE}>
            As high as {ordinal(best.position)}
          </h2>
          <p className={BODY}>
            {best.night === 1
              ? "Straight from the first night."
              : `After night ${best.night}, on ${day(best.date)}.`}{" "}
            {story.place.position === best.position
              ? sofar
                ? "And that is where it stands."
                : "And that is where it finished."
              : sofar
                ? `${ordinal(story.place.position)} now.`
                : `Finished ${ordinal(story.place.position)}.`}
          </p>
          <Journey positions={story.journey} of={story.place.of} />
        </Card>
      ),
    });
  }

  if (story.rating) {
    const { from, to, peak } = story.rating;
    const change = Math.round(to - from);
    slides.push({
      key: "rating",
      label: "The rating",
      tone: "sheet",
      content: (
        <Card label="The rating">
          <div className="flex items-baseline gap-4">
            <RollingNumber value={displayRating(to)} className="scoreboard text-7xl" />
            <span
              className={cn(
                "scoreboard text-3xl",
                change > 0 ? "text-win" : change < 0 ? "text-loss" : "text-muted-foreground"
              )}
            >
              {change > 0 ? "+" : change < 0 ? "−" : "±"}
              {Math.abs(change)}
            </span>
          </div>
          <p className={BODY}>
            Came into the season on {displayRating(from)} and{" "}
            {change > 0 ? "climbed" : change < 0 ? "slipped" : "held"} to {displayRating(to)}. At
            its best, {displayRating(peak.rating)} on {day(peak.date)}.
          </p>
        </Card>
      ),
    });
  }

  const mate = story.partner ? playerFor(story.partner.playerId) : undefined;
  const regular = story.regular ? playerFor(story.regular.playerId) : undefined;
  if (mate || regular) {
    slides.push({
      key: "partner",
      label: "Partnerships",
      tone: "sheet",
      content: (
        <Card label="Partnerships">
          {mate && story.partner && (
            <div className="flex flex-col gap-3">
              <div className="flex -space-x-3">
                <PlayerAvatar name={name} image={player.image} size="lg" className="ring-4 ring-surface" />
                <PlayerAvatar name={mate.name} image={mate.image} size="lg" className="ring-4 ring-surface" />
              </div>
              <h2 className={HEADLINE}>{first} &amp; {mate.name.split(/\s+/)[0]}</h2>
              <p className={BODY}>
                {story.partner.ledger.wins}W {story.partner.ledger.draws}D {story.partner.ledger.losses}L in{" "}
                {plural(story.partner.ledger.played, "game")} together
                {values && (
                  <>
                    {" "}— {ppg(pointsPerGame(story.partner.ledger, values))} points a game, against{" "}
                    {ppg(ownPpg)} across the season
                  </>
                )}
                . The best record {first} had with anybody.
              </p>
              <Link
                href={`/lineups?p=${player.id},${mate.id}&t=s:${season.id}`}
                className="focus-ring self-start text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Open the pair in the line-up lab
              </Link>
            </div>
          )}
          {regular && story.regular && regular.id !== mate?.id && (
            <p className={cn(BODY, "flex items-center gap-3")}>
              <PlayerAvatar name={regular.name} image={regular.image} size="sm" />
              <span>
                Most often alongside {regular.name}: {plural(story.regular.played, "game")},{" "}
                {plural(story.regular.wins, "win")}.
              </span>
            </p>
          )}
        </Card>
      ),
    });
  }

  // On the record only, which needs the table's points; the odds have a card
  // of their own.
  if (values && story.mates.length + story.opponents.length > 0) {
    slides.push({
      key: "web",
      label: `${first}'s web`,
      tone: "plain",
      content: (
        <Card label={`${first}'s web · ${season.name}`}>
          <PlayerWeb
            player={player}
            own={record}
            mates={story.mates}
            opponents={story.opponents}
            playerFor={playerFor}
            values={values}
          />
        </Card>
      ),
    });
  }

  const nemesis = story.nemesis ? playerFor(story.nemesis.playerId) : undefined;
  if (nemesis && story.nemesis) {
    slides.push({
      key: "nemesis",
      label: "Nemesis",
      tone: "plain",
      content: (
        <Card label="Nemesis">
          <PlayerAvatar name={nemesis.name} image={nemesis.image} size="xl" />
          <h2 className={HEADLINE}>{nemesis.name}</h2>
          <p className={BODY}>
            {plural(story.nemesis.ledger.played, "game")} on the other side: {story.nemesis.ledger.wins}W{" "}
            {story.nemesis.ledger.draws}D {story.nemesis.ledger.losses}L
            {values && (
              <>
                , {ppg(pointsPerGame(story.nemesis.ledger, values))} points a game against{" "}
                {ppg(ownPpg)} across the season
              </>
            )}
            . Nobody got the better of {first} more.
          </p>
        </Card>
      ),
    });
  }

  slides.push({
    key: "runs",
    label: "Runs",
    tone: "sheet",
    content: (
      <Card label="Runs">
        <div className="grid grid-cols-1 gap-3">
          <Tile label="Wins in a row" value={story.winRun} tone="text-win" />
          <Tile label="Games unbeaten" value={story.unbeatenRun} tone="text-draw" />
          <Tile label="Nights in a row without missing one" value={story.attendanceRun} />
        </div>
      </Card>
    ),
  });

  // The one card for the odds. Everything else in a wrapped is what
  // happened; this is how that compares with what the ratings expected, for
  // anybody who wants it, with the giant-killing that only the odds can see.
  slides.push({
    key: "odds",
    label: "Against the odds",
    tone: "plain",
    content: (
      <Card label="Against the odds">
        <h2 className={HEADLINE}>
          {signedWins(record.above)} <span className="text-2xl font-bold">wins</span>
        </h2>
        <p className={BODY}>
          Before every kick-off the ratings gave {first}&apos;s side a chance. Added up, they expected{" "}
          {record.expected.toFixed(1)} wins; {first} came away with {record.actual.toFixed(1)}, a draw
          counting half.
        </p>
        <LuckBar ledger={record} />
        <Verdict verdict={record.verdict} />
        {story.upset && (
          <p className={BODY}>
            Biggest giant-killing: on {day(story.upset.date)} {first}&apos;s side was given{" "}
            {Math.round(story.upset.chance * 100)}% and won.{" "}
            <Link
              href={`/matches/${story.upset.matchId}`}
              className="focus-ring font-medium text-accent underline-offset-4 hover:underline"
            >
              See the match
            </Link>
          </p>
        )}
      </Card>
    ),
  });

  slides.push({
    key: "summary",
    label: "In one picture",
    tone: "pitch",
    content: (
      <Card label={`${season.name} · ${name}`}>
        <div className="grid grid-cols-2 gap-3 text-foreground">
          <Tile label="Played" value={record.played} />
          <Tile
            label={sofar ? "Place so far" : "Finished"}
            value={story.place ? ordinal(story.place.position) : "—"}
          />
          <Tile label="Won–drawn–lost" value={`${record.wins}–${record.draws}–${record.losses}`} />
          <Tile label="Points a game" value={values ? ppg(ownPpg) : "—"} />
          <Tile label="Rating" value={story.rating ? displayRating(story.rating.to) : "—"} />
          <Tile label="Best run" value={`${story.winRun}W`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareImageButton
            src={`/api/share/wrapped/${season.id}/${player.id}`}
            fileName={`${season.name}-${name}-wrapped.png`.replace(/\s+/g, "-").toLowerCase()}
            title={`${name}'s ${season.name}, as a picture`}
            alt={`${name}'s ${season.name} wrapped`}
            label="Share the picture"
            // Its own colours: on the grass it would otherwise take the
            // chalk the card is written in, white on white in a light theme.
            className="bg-background text-foreground hover:bg-surface"
          />
          <Link
            href={`/seasons/${season.id}#wrapped`}
            className="focus-ring inline-flex items-center rounded-lg border border-chalk/50 px-3 text-sm font-medium hover:bg-chalk/10"
          >
            Everyone else&apos;s
          </Link>
        </div>
      </Card>
    ),
  });

  return slides;
}
