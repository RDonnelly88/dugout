import { ELO } from "@/lib/config";
import { displayRating } from "@/lib/elo";
import type { fadingSummary } from "@/lib/ratings-guide";
import { cn } from "@/lib/utils";

type Summary = ReturnType<typeof fadingSummary>;

interface Step {
  label: string;
  /** A step up or down from where the last one left off. */
  delta?: number;
  /** A level the rating stands at: the start, and today. */
  level?: number;
}

const signed = (x: number) =>
  Math.round(x) === 0 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(Math.round(x))}`;
const signed1 = (x: number) =>
  Math.abs(x) < 0.05 ? "0" : `${x > 0 ? "+" : "−"}${Math.abs(x).toFixed(1)}`;

/** The stretch of rating a waterfall is drawn across. */
export interface WaterfallScale {
  low: number;
  high: number;
}

/** Each step with where it starts and ends, the start and today as levels. */
function waterfallSteps({ gained, cost, all }: Summary, rating: number) {
  const steps: Step[] = [
    { label: "Everybody starts on", level: ELO.start },
    { label: `The ${gained.games} ${gained.games === 1 ? "game" : "games"} that gained points, on the night`, delta: gained.night },
    { label: `The ${cost.games} ${cost.games === 1 ? "game" : "games"} that cost points, on the night`, delta: cost.night },
    { label: "Faded off what was gained since", delta: gained.faded },
    { label: "Faded off what was lost since, given back", delta: cost.faded },
    { label: "Rating today", level: rating },
    { label: "Next match, before a ball is kicked", delta: all.next },
  ].filter((step) => step.level !== undefined || Math.abs(step.delta!) >= 0.05);

  let at: number = ELO.start;
  return steps.map((step) => {
    if (step.level !== undefined) {
      at = step.level;
      return { ...step, from: step.level, to: step.level };
    }
    const from = at;
    at += step.delta!;
    return { ...step, from, to: at };
  });
}

/**
 * The lowest and highest any step of a rating's waterfall reaches. Two
 * waterfalls side by side are drawn across the extent of both, so the same
 * width of bar is the same number of points in each.
 */
export function waterfallExtent(summary: Summary, rating: number): WaterfallScale {
  const ends = waterfallSteps(summary, rating).flatMap((d) => [d.from, d.to]);
  return { low: Math.min(...ends), high: Math.max(...ends) };
}

/**
 * A rating as a waterfall: from the start, up by everything the games that
 * gained points were worth on the night, down by everything the games that
 * cost points were, then each of those shrunk by the fading since, landing
 * on the rating today, and the small step the next match will take.
 *
 * Drawn across rather than up, a row a step, so each label sits beside its
 * bar on a phone. Every bar floats from where the last one ended, and a
 * faint line marks the start throughout, so a fade that pulls towards it
 * can be seen doing so.
 */
export default function RatingWaterfall({
  summary,
  rating,
  scale,
}: {
  summary: Summary;
  rating: number;
  /** Drawn across this instead of its own extent, to line up with another. */
  scale?: WaterfallScale;
}) {
  const drawn = waterfallSteps(summary, rating);
  const { low, high } = scale ?? waterfallExtent(summary, rating);
  const pad = Math.max((high - low) * 0.04, 2);
  const span = high - low + pad * 2;
  const x = (value: number) => ((value - (low - pad)) / span) * 100;

  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-surface-2/40 p-3 tabular">
      {drawn.map((step) => {
        const level = step.level !== undefined;
        const up = step.to >= step.from;
        return (
          <div
            key={step.label}
            className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.25rem] items-center gap-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_3.5rem]"
          >
            <span className={cn("text-xs leading-tight", level ? "font-semibold" : "text-muted-foreground")}>
              {step.label}
            </span>
            <span className="relative h-5">
              {/* The start, the line everything fades towards. */}
              <span
                aria-hidden
                className="absolute inset-y-0 border-l border-dashed border-border-strong"
                style={{ left: `${x(ELO.start)}%` }}
              />
              {level ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-1 -translate-x-1/2 rounded-full bg-foreground"
                  style={{ left: `${x(step.to)}%` }}
                />
              ) : (
                <span
                  aria-hidden
                  className={cn("absolute inset-y-0.5 rounded-sm", up ? "bg-win" : "bg-loss")}
                  style={{
                    left: `${x(Math.min(step.from, step.to))}%`,
                    // Never thinner than a hairline, so a small step is still seen.
                    width: `max(2px, ${(Math.abs(step.to - step.from) / span) * 100}%)`,
                  }}
                />
              )}
            </span>
            <span
              className={cn(
                "text-right text-sm",
                level ? "font-semibold" : up ? "text-win" : "text-loss"
              )}
            >
              {level
                ? displayRating(step.to)
                : // The small steps to a tenth: a fade of under a point would round to nothing.
                  Math.abs(step.delta!) < 10
                  ? signed1(step.delta!)
                  : signed(step.delta!)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
