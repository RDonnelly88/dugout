import { SKILL } from "@/lib/config";

const LEVELS = Array.from(
  { length: SKILL.max - SKILL.min + 1 },
  (_, i) => SKILL.min + i
);

/**
 * A hand-set level, drawn rather than named.
 *
 * The scale used to carry words — "Steady", "Ringer" — and a word invites an
 * argument about whether it is the right one, which is not a thing a five is
 * meant to start. Five pips say the same thing and cannot be misread.
 */
export default function SkillScale({
  level,
  size = "sm",
  className = "",
}: {
  level: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const filled = Math.min(Math.max(level, SKILL.min), SKILL.max);
  const pip = size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {/* Read out as a number: five dots mean nothing to a screen reader
          however they look. */}
      <span className="sr-only">
        Skill {filled} of {SKILL.max}
      </span>
      {LEVELS.map((option) => (
        <span
          key={option}
          aria-hidden
          className={`${pip} rounded-full ${
            option <= filled ? "bg-accent" : "bg-border-strong/50"
          }`}
        />
      ))}
    </span>
  );
}
