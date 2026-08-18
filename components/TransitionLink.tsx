"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A link that crosses the browser's view transition, where there is one.
 *
 * Going from the grid to a player's page replaces the whole screen, and
 * nothing on the new page says which of the twelve faces was tapped. Naming
 * the avatar on both sides lets the browser carry it across: it grows out of
 * the card and into the header, so the page you land on is visibly the thing
 * you touched.
 *
 * Every part of this is optional. A browser without the API, or a person who
 * asked for less motion, gets an ordinary `next/link` and the navigation it
 * always did.
 */

/**
 * The shared name. One at a time, because only one element on each side of a
 * transition may carry a given name — the browser abandons the whole
 * transition if two do.
 */
export const AVATAR_TRANSITION = "player-avatar";

/** How long to wait for the new page before giving up and moving on. */
const PATIENCE = 700;

export default function TransitionLink({
  href,
  className,
  children,
  shareAvatar = false,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  /**
   * Hands the avatar inside this link to the destination. The element to
   * carry across is the one marked `data-avatar`.
   */
  shareAvatar?: boolean;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const anchor = useRef<HTMLAnchorElement>(null);
  const [pending, startTransition] = useTransition();
  const arrived = useRef<(() => void) | null>(null);
  const [navigating, setNavigating] = useState(false);

  // React tells us the navigation is done by ending the transition, which is
  // the only honest moment to let the browser take its second photograph.
  useEffect(() => {
    if (navigating && !pending && arrived.current) {
      arrived.current();
      arrived.current = null;
      setNavigating(false);
    }
  }, [navigating, pending]);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // A middle click, or a click with a modifier, means somewhere else.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    if (reduced || !document.startViewTransition) return;

    event.preventDefault();

    const avatar = shareAvatar
      ? anchor.current?.querySelector<HTMLElement>("[data-avatar]")
      : null;
    if (avatar) avatar.style.viewTransitionName = AVATAR_TRANSITION;

    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          // A promise that never settles would leave the browser holding a
          // still of the old page over a live one. The timeout is the way out.
          const giveUp = setTimeout(resolve, PATIENCE);
          arrived.current = () => {
            clearTimeout(giveUp);
            resolve();
          };
          setNavigating(true);
          startTransition(() => router.push(href));
        })
    );

    // Whether it played, was skipped or was interrupted, the name has to come
    // off: a permanent one would collide with the next transition's.
    transition.finished.finally(() => {
      if (avatar) avatar.style.viewTransitionName = "";
    });
  };

  return (
    <Link ref={anchor} href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
