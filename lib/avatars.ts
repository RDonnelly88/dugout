import {
  Bird,
  Cat,
  CircleUser,
  Crown,
  Dog,
  Flame,
  Ghost,
  Heart,
  Medal,
  PersonStanding,
  Rocket,
  Shield,
  Smile,
  Star,
  Swords,
  Target,
  Trophy,
  User,
  UserCog,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The avatars a player can choose.
 *
 * An explicit map rather than a name looked up on the lucide namespace at
 * runtime. Two reasons: `import * as LucideIcons` pulls the entire library
 * into the bundle to render one glyph, and a lookup that misses renders
 * nothing at all — which is how "Robot" sat in the picker as a blank tile,
 * lucide having no such icon.
 */
export const AVATAR_ICONS: Record<string, LucideIcon> = {
  User,
  UserRound,
  CircleUser,
  PersonStanding,
  Smile,
  Ghost,
  Cat,
  Dog,
  Bird,
  Crown,
  Trophy,
  Medal,
  Star,
  Heart,
  Flame,
  Zap,
  Rocket,
  Shield,
  Swords,
  Target,
  UserCog,
};

export const AVATAR_ICON_NAMES = Object.keys(AVATAR_ICONS);

const ICON_PREFIX = "icon:";

/**
 * What the `image` column is holding.
 *
 * Three shapes have accumulated: an `icon:Name` reference chosen from the
 * picker, a `data:` URL from an older upload, and a plain http(s) URL. Only the
 * season card ever understood the first, so an avatar picked in the editor
 * rendered as a broken image on every other page. Deciding it in one place is
 * what stops that happening again.
 */
export type Avatar =
  | { kind: "icon"; Icon: LucideIcon }
  | { kind: "image"; src: string }
  | { kind: "none" };

export function readAvatar(image: string | null | undefined): Avatar {
  if (!image) return { kind: "none" };

  if (image.startsWith(ICON_PREFIX)) {
    // Annotated, because the index signature claims every key resolves and a
    // stored name from an older list does not.
    const Icon: LucideIcon | undefined =
      AVATAR_ICONS[image.slice(ICON_PREFIX.length)];
    // An unknown name is a value from an older list; fall through to the
    // default rather than rendering an empty circle.
    // An explicit comparison, not a truthiness test: TypeScript reads
    // `if (fn)` on a function-typed value as a mistaken call.
    return Icon !== undefined ? { kind: "icon", Icon } : { kind: "none" };
  }

  if (image.startsWith("data:") || image.startsWith("http")) {
    return { kind: "image", src: image };
  }

  return { kind: "none" };
}

export const toIconValue = (name: string) => `${ICON_PREFIX}${name}`;
