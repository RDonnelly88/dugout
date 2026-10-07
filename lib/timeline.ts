import { RECENT_MATCHES } from "./config";
import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

/**
 * Which stretch of the squad's history a question is about.
 *
 * "Recent" and "months" are counted back from the squad's latest result, not
 * from today, so a summer off does not empty the window and the same history
 * always gives the same answer.
 */
export type Timeline =
  | { kind: "all" }
  | { kind: "season"; seasonId: string }
  /** The squad's last few results. */
  | { kind: "recent"; matches: number }
  /** Back this many months from the latest result. */
  | { kind: "months"; months: number }
  /** Inclusive at both ends, as plain days. Either end may be open. */
  | { kind: "range"; from?: string; to?: string };

const day = (value: string) => value.slice(0, 10);
const time = (value: string) => new Date(value).getTime();

/** The matches inside a timeline, oldest first. */
export function withinTimeline(matches: Match[], timeline: Timeline): Match[] {
  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => time(a.date) - time(b.date));

  switch (timeline.kind) {
    case "all":
      return played;
    case "season":
      return played.filter((m) => m.seasonId === timeline.seasonId);
    case "recent":
      return timeline.matches > 0 ? played.slice(-timeline.matches) : [];
    case "months": {
      const latest = played.at(-1);
      if (!latest) return [];
      const cutoff = new Date(latest.date);
      cutoff.setMonth(cutoff.getMonth() - timeline.months);
      return played.filter((m) => time(m.date) > cutoff.getTime());
    }
    case "range":
      return played.filter(
        (m) =>
          (!timeline.from || day(m.date) >= timeline.from) &&
          (!timeline.to || day(m.date) <= timeline.to)
      );
  }
}

/** How far back "the last year" reaches, in months. */
export const LAST_MONTHS = 12;

/**
 * A timeline kept in the address as one short token, so a question can be
 * sent to the group chat and open on the same stretch: `all`, `recent`,
 * `year`, `s:<season id>` or `r:<from>_<to>`.
 */
export function readTimeline(token: string | null): Timeline {
  if (!token || token === "all") return { kind: "all" };
  if (token === "recent") return { kind: "recent", matches: RECENT_MATCHES };
  if (token === "year") return { kind: "months", months: LAST_MONTHS };
  if (token.startsWith("s:")) return { kind: "season", seasonId: token.slice(2) };
  if (token.startsWith("r:")) {
    const [from, to] = token.slice(2).split("_");
    return { kind: "range", from: from || undefined, to: to || undefined };
  }
  return { kind: "all" };
}
