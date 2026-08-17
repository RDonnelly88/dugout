"use client";

import { useEffect, useState } from "react";

/** Tailwind's `sm`, so a breakpoint change is made in one place. */
const SMALL = "(max-width: 639px)";

/**
 * Whether this is a phone-sized screen.
 *
 * Starts false and corrects itself once mounted rather than guessing on the
 * server: the server has no viewport, and rendering one answer then hydrating
 * with the other is a mismatch. Everything that reads this only appears after
 * a tap, by which time the answer is real, so the initial false is never seen.
 */
export function useIsSmallScreen(): boolean {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(SMALL);
    const sync = () => setSmall(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return small;
}
