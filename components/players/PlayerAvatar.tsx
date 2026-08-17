import type { CSSProperties } from "react";
import { readAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: { box: "h-7 w-7", glyph: "h-4 w-4", text: "text-[11px]" },
  sm: { box: "h-9 w-9", glyph: "h-5 w-5", text: "text-xs" },
  md: { box: "h-12 w-12", glyph: "h-6 w-6", text: "text-sm" },
  lg: { box: "h-16 w-16", glyph: "h-8 w-8", text: "text-lg" },
  xl: { box: "h-24 w-24", glyph: "h-12 w-12", text: "text-2xl" },
} as const;

export type AvatarSize = keyof typeof SIZES;

/**
 * A player's face, wherever they appear.
 *
 * Every surface renders a player through this, so the same person looks the
 * same on a card, in a table, in the randomiser and on their own page. The
 * three shapes the `image` column can hold are resolved in one place — passing
 * the raw value to an `<img>` is what made a chosen icon show as a broken
 * image everywhere except the season card.
 *
 * With nothing set, the initial. Better than a generic silhouette when twelve
 * of them sit in a grid: the letter is what tells them apart.
 */
export default function PlayerAvatar({
  name,
  image,
  size = "md",
  className,
  style,
}: {
  name: string;
  image: string | null | undefined;
  size?: AvatarSize;
  className?: string;
  /** For the one thing a class cannot carry: a view transition name. */
  style?: CSSProperties;
}) {
  const avatar = readAvatar(image);
  const s = SIZES[size];

  return (
    <span
      // Marks the face a link may hand to the page it navigates to. Every
      // avatar carries it; the link picks the one inside itself.
      data-avatar
      style={style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 text-muted-foreground",
        s.box,
        className
      )}
      // The name is already beside every use of this, so the picture is
      // decorative and announcing it again is noise.
      aria-hidden
    >
      {avatar.kind === "image" ? (
        <img src={avatar.src} alt="" className="h-full w-full object-cover" />
      ) : avatar.kind === "icon" ? (
        <avatar.Icon className={cn(s.glyph, "text-accent")} />
      ) : (
        <span className={cn("font-semibold uppercase text-foreground", s.text)}>
          {name.trim().charAt(0) || "?"}
        </span>
      )}
    </span>
  );
}
