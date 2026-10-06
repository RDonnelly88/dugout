import { XW } from "@/lib/config";
import type { Verdict as VerdictKind } from "@/lib/expected-wins";
import { cn } from "@/lib/utils";

const COPY: Record<VerdictKind, { label: string; tone: string }> = {
  early: { label: "Too early to say", tone: "bg-surface-2 text-muted-foreground" },
  luck: { label: "Could be luck", tone: "bg-surface-2 text-foreground" },
  above: { label: "Better than luck", tone: "bg-win/15 text-win" },
  below: { label: "Worse than luck", tone: "bg-loss/15 text-loss" },
};

/**
 * What a gap between results and expected wins amounts to, in words.
 *
 * Said plainly rather than as a percentage of confidence, because the honest
 * answers are only three: there is not enough to go on, it is the kind of gap
 * luck produces, or it is not.
 */
export default function Verdict({
  verdict,
  className,
}: {
  verdict: VerdictKind;
  className?: string;
}) {
  const { label, tone } = COPY[verdict];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone,
        className
      )}
      title={
        verdict === "early"
          ? `Fewer than ${XW.minGames} games together`
          : verdict === "luck"
            ? "Inside the range ordinary luck would give these games"
            : "Further from the odds than luck alone usually gets"
      }
    >
      {label}
    </span>
  );
}
