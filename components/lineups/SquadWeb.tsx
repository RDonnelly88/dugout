"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signedWins } from "@/lib/expected-wins";
import type { PointValues } from "@/lib/season-positions";
import {
  averagePointsPerGame,
  enoughGames,
  firmness,
  lean,
  pointsPerGame,
  ppg,
  tone,
  type Measure,
} from "@/lib/measure";
import type { SquadWeb as Web, WebLink } from "@/lib/squad-web";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import MeasureToggle from "@/components/MeasureToggle";
import Verdict from "@/components/xw/Verdict";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import { shortNames } from "@/lib/short-names";
import type { Player } from "@/types";

/** The avatar is `xs`: 28px across. */
const NODE = 28;
/** Room outside the ring for the names. */
const LABEL_ROOM = 64;
/** Links shown in the list under the web, each way. */
const LISTED = 4;

/**
 * To a hundredth of a pixel. The server and the browser can disagree about the
 * last few digits of a sine, and an unrounded coordinate then differs between
 * the page as served and the page as hydrated.
 */
const px = (value: number) => Math.round(value * 100) / 100;

const STROKE = { ahead: "stroke-win", behind: "stroke-loss", level: "stroke-border-strong" } as const;
const TEXT = { ahead: "text-win", behind: "text-loss", level: "text-muted-foreground" } as const;

/** Wins with a draw as a half, to one place, dropping a needless ".0". */
const wins = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/**
 * The squad as a web: everybody round a ring, a line wherever two of them
 * have shared a side.
 *
 * Read two ways (see `Measure`). On the record, a line's colour is how
 * many points a game the pair took against the squad's average over the same
 * stretch, and it is drawn firmer the more games there were. Against the odds,
 * its colour is wins above or below expected and its firmness the verdict:
 * faint while it is too early to say, firm once it is more than luck. Either
 * way green is ahead, red behind, and a thicker line is more games. Tap a face
 * to light up their lines; tap a line to open the pair in the lab. The list
 * under it says the same in words.
 */
export default function SquadWeb({
  web,
  order,
  byId,
  picked,
  onOpenPair,
  onAddPlayer,
  values,
}: {
  web: Web;
  /** What a win and a draw are worth; without them the web reads the odds only. */
  values: PointValues | null;
  /** Seating round the ring; see `ringOrder`. */
  order: string[];
  byId: Map<string, Player>;
  /** Already in the line-up, so ringed. */
  picked: string[];
  onOpenPair: (a: string, b: string) => void;
  onAddPlayer: (id: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<WebLink | null>(null);
  const [only, setOnly] = useState<"all" | "telling">("all");
  const [chosen, setChosen] = useState<Measure>("record");
  const measure: Measure = values ? chosen : "odds";
  // Only read on the record, which is only offered with real values; the
  // stand-in keeps the odds reading free of a null check at every turn.
  const points = useMemo(() => values ?? { win: 1, draw: 0.5 }, [values]);
  // The squad's own points a game over the stretch: a pair above it did
  // better together than the average game went.
  const baseline = useMemo(
    () => averagePointsPerGame(web.players.map((p) => p.ledger), points),
    [web, points]
  );
  const toneOf = (link: WebLink) => tone(link.ledger, measure, points, baseline);
  const leanOf = (link: WebLink) => lean(link.ledger, measure, points, baseline);

  // Drawn at its real width, so names stay a readable size on a phone rather
  // than shrinking with a fixed drawing.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(300, Math.round(el.clientWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const size = Math.min(width, 640);
  const centre = size / 2;
  const radius = centre - LABEL_ROOM;
  const narrow = size < 480;

  const seat = useMemo(() => {
    const at = new Map<string, { x: number; y: number; angle: number }>();
    order.forEach((id, i) => {
      // From the top, clockwise.
      const angle = -Math.PI / 2 + (i / Math.max(order.length, 1)) * Math.PI * 2;
      at.set(id, {
        x: px(centre + radius * Math.cos(angle)),
        y: px(centre + radius * Math.sin(angle)),
        angle,
      });
    });
    return at;
  }, [order, centre, radius]);

  const most = Math.max(1, ...web.links.map((l) => l.ledger.played));
  // On the odds, beyond luck; on the record, enough games to rank and a lean
  // worth a colour.
  const telling = (link: WebLink) =>
    measure === "odds"
      ? link.ledger.verdict === "above" || link.ledger.verdict === "below"
      : enoughGames(link.ledger) && toneOf(link) !== "level";
  const shown = web.links.filter((l) => only === "all" || telling(l));
  // Faint links first, so the telling ones are drawn on top of them.
  const layered = [...shown].sort(
    (x, y) => firmness(x.ledger, measure, most) - firmness(y.ledger, measure, most)
  );

  const touches = (link: WebLink, id: string | null) => id !== null && (link.a === id || link.b === id);
  const name = (id: string) => byId.get(id)?.name ?? "Unknown";
  const shortName = useMemo(() => shortNames([...byId.values()]), [byId]);

  const path = (link: WebLink) => {
    const p = seat.get(link.a)!;
    const q = seat.get(link.b)!;
    // Bowed towards the middle, so lines between neighbours curve inside the
    // ring rather than running along it.
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    const cx = px(centre + (mx - centre) * 0.2);
    const cy = px(centre + (my - centre) * 0.2);
    return `M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}`;
  };

  const focusLinks = focus
    ? web.links
        .filter((l) => touches(l, focus))
        .sort((x, y) => leanOf(y) - leanOf(x) || y.ledger.played - x.ledger.played)
    : [];
  const ranked = web.links.filter((l) => enoughGames(l.ledger));
  const best = [...ranked].sort((x, y) => leanOf(y) - leanOf(x)).slice(0, LISTED);
  const worst = [...ranked]
    .sort((x, y) => leanOf(x) - leanOf(y))
    .filter((l) => !best.includes(l))
    .slice(0, LISTED);

  // A function rather than a component: declared in here, a component would
  // be a new type every render and remount the list.
  const linkButton = (link: WebLink, from?: string) => {
    const other = from ? (link.a === from ? link.b : link.a) : null;
    return (
      <li key={`${link.a}|${link.b}`}>
        <button
          type="button"
          onClick={() => onOpenPair(link.a, link.b)}
          className="focus-ring flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-border-strong"
        >
          <span className="flex shrink-0 -space-x-2">
            {(other ? [other] : [link.a, link.b]).map((id) => (
              <PlayerAvatar key={id} name={name(id)} image={byId.get(id)?.image} size="xs" />
            ))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {other ? name(other) : `${name(link.a)} & ${name(link.b)}`}
            </span>
            <span className="tabular block text-xs text-muted-foreground">
              {measure === "record"
                ? `${link.ledger.played} together · ${link.ledger.wins}W ${link.ledger.draws}D ${link.ledger.losses}L`
                : `${link.ledger.played} together · ${wins(link.ledger.actual)} v ${link.ledger.expected.toFixed(1)} xW`}
            </span>
          </span>
          <span className={cn("tabular text-right font-semibold", TEXT[toneOf(link)])}>
            {measure === "record" ? (
              <>
                {ppg(pointsPerGame(link.ledger, points))}
                <span className="block text-[10px] font-normal text-muted-foreground">pts a game</span>
              </>
            ) : (
              signedWins(link.ledger.above)
            )}
          </span>
          {measure === "odds" && (
            <Verdict verdict={link.ledger.verdict} className="hidden sm:inline-flex" />
          )}
        </button>
      </li>
    );
  };

  if (order.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Not enough games in this stretch to draw a web.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {values && <MeasureToggle value={measure} onChange={setChosen} />}
        <SegmentedControl
          label="Which links to draw"
          value={only}
          onValueChange={(next) => setOnly(next as "all" | "telling")}
          className="h-9"
        >
          <SegmentedControlItem value="all" className="h-full px-3 text-xs font-medium">
            Every link
          </SegmentedControlItem>
          <SegmentedControlItem value="telling" className="h-full px-3 text-xs font-medium">
            {measure === "odds" ? "Beyond luck" : "Telling ones"}
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-win" aria-hidden />
          {measure === "odds" ? "Beat the odds together" : `More than the squad's ${ppg(baseline)} pts a game`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-loss" aria-hidden />
          {measure === "odds" ? "Fell short" : "Fewer"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-border-strong opacity-40" aria-hidden />
          {measure === "odds" ? "Faint: too early or could be luck" : "Faint: under five games"}
        </span>
        <span>Thicker: more games</span>
      </div>

      <div ref={box} className="relative mx-auto w-full max-w-[640px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          // One image to a screen reader, which gets the same links as the
          // lists under it.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="img"
          aria-label={`The squad as a web of who has played with whom, coloured by ${measure === "odds" ? "how they did against the odds" : "points a game together"}. The same links are listed below.`}
          className="block overflow-visible"
        >
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            className="fill-none stroke-border"
            strokeDasharray="2 5"
          />

          {layered.map((link) => {
            const lit = focus === null || touches(link, focus);
            const strength = firmness(link.ledger, measure, most);
            return (
              <path
                key={`${link.a}|${link.b}`}
                d={path(link)}
                className={cn("fill-none transition-opacity", STROKE[toneOf(link)])}
                strokeWidth={1 + 4 * (link.ledger.played / most)}
                strokeLinecap="round"
                opacity={lit ? (focus ? Math.max(strength, 0.45) : strength) : 0.04}
              />
            );
          })}

          {/* Wide invisible strokes over the drawn ones, so a thin line can
              still be hit with a thumb. */}
          {shown.map((link) => (
            <path
              key={`hit-${link.a}|${link.b}`}
              d={path(link)}
              className="cursor-pointer fill-none stroke-transparent"
              strokeWidth={12}
              onMouseEnter={() => setHover(link)}
              onMouseLeave={() => setHover((h) => (h === link ? null : h))}
              onClick={() => onOpenPair(link.a, link.b)}
            >
              <title>
                {measure === "record"
                  ? `${name(link.a)} & ${name(link.b)}: ${link.ledger.played} games together, ${link.ledger.wins}W ${link.ledger.draws}D ${link.ledger.losses}L, ${ppg(pointsPerGame(link.ledger, points))} points a game`
                  : `${name(link.a)} & ${name(link.b)}: ${link.ledger.played} games together, ${signedWins(link.ledger.above)} wins against the odds`}
              </title>
            </path>
          ))}

          {order.map((id) => {
            const at = seat.get(id)!;
            const player = byId.get(id);
            const ringed = picked.includes(id);
            const dim = focus !== null && focus !== id &&
              !web.links.some((l) => touches(l, focus) && touches(l, id));
            const cos = Math.cos(at.angle);
            const label = name(id);
            // First names round the ring, where full ones ran off the edge
            // of a phone; the full name is on the face's button.
            const short = shortName.get(id) ?? label;
            return (
              <g key={id} opacity={dim ? 0.35 : 1} className="transition-opacity">
                <text
                  x={px(centre + (radius + NODE / 2 + 8) * cos)}
                  y={px(centre + (radius + NODE / 2 + 8) * Math.sin(at.angle) + 4)}
                  textAnchor={cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle"}
                  className={cn(
                    "fill-foreground text-[12px]",
                    (focus === id || ringed) && "font-semibold"
                  )}
                >
                  {narrow && short.length > 9 ? `${short.slice(0, 8)}…` : short}
                </text>
                <foreignObject
                  x={at.x - NODE / 2 - 3}
                  y={at.y - NODE / 2 - 3}
                  width={NODE + 6}
                  height={NODE + 6}
                >
                  <button
                    type="button"
                    aria-pressed={focus === id}
                    aria-label={`Light up ${label}'s links`}
                    onClick={() => setFocus((f) => (f === id ? null : id))}
                    className={cn(
                      "focus-ring m-[3px] block rounded-full",
                      (focus === id || ringed) && "ring-2 ring-accent ring-offset-1 ring-offset-surface"
                    )}
                  >
                    <PlayerAvatar name={label} image={player?.image} size="xs" />
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {hover && (
          <output className="pointer-events-none absolute left-1/2 top-1/2 block w-56 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-3 text-sm shadow-lg">
            <p className="font-semibold">
              {name(hover.a)} &amp; {name(hover.b)}
            </p>
            <p className="tabular text-xs text-muted-foreground">
              {hover.ledger.played} together · {hover.ledger.wins}W {hover.ledger.draws}D{" "}
              {hover.ledger.losses}L
              {values && ` · ${ppg(pointsPerGame(hover.ledger, values))} pts a game`}
            </p>
            <p className="tabular mt-1 text-xs">
              {wins(hover.ledger.actual)} won v {hover.ledger.expected.toFixed(1)} xW ·{" "}
              <span className={hover.ledger.above >= 0 ? "text-win" : "text-loss"}>
                {signedWins(hover.ledger.above)}
              </span>
            </p>
            <Verdict verdict={hover.ledger.verdict} className="mt-2" />
          </output>
        )}
      </div>

      {focus ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{name(focus)}&apos;s links, best first</h3>
            <div className="flex gap-2">
              {!picked.includes(focus) && (
                <button
                  type="button"
                  onClick={() => onAddPlayer(focus)}
                  className="focus-ring rounded-lg border border-border px-3 py-1.5 text-sm hover:border-border-strong"
                >
                  Add to the line-up
                </button>
              )}
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="focus-ring rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Show everyone
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {focusLinks.map((link) => linkButton(link, focus))}
          </ul>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="eyebrow mb-2">
              {measure === "record" ? "Best records together" : "Strongest links"}
            </h3>
            {best.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nobody has enough games together yet.</p>
            ) : (
              <ul className="space-y-2">
                {best.map((link) => linkButton(link))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="eyebrow mb-2">
              {measure === "record" ? "Worst records together" : "Weakest links"}
            </h3>
            {worst.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nobody has enough games together yet.</p>
            ) : (
              <ul className="space-y-2">
                {worst.map((link) => linkButton(link))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
