"use client";

import { useEffect, useState } from "react";

/**
 * Resolved colours for charts.
 *
 * Recharts writes SVG presentation attributes rather than CSS, so `stroke` and
 * `fill` cannot take a `var()`. The values have to be read off the document
 * once the theme is in place, and re-read when it changes — which is why this
 * watches the attribute and the OS preference rather than reading once.
 */
const TOKENS = [
  "accent",
  "muted-foreground",
  "border",
  "grid",
  "win",
  "draw",
  "loss",
  "info",
  "surface",
  "foreground",
] as const;

/** How many `--series-N` colours globals.css defines. */
const SERIES = 8;

type Token = (typeof TOKENS)[number];
export type ChartTheme = Record<Token, string> & {
  /** One colour per line, for a chart with a line a player. */
  series: string[];
};

/** What a chart is drawn in until the document can be read. */
const placeholder = (): ChartTheme => ({
  ...(Object.fromEntries(TOKENS.map((t) => [t, "#888"])) as Record<Token, string>),
  series: Array.from({ length: SERIES }, () => "#888"),
});

function read(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);
  const resolve = (name: string) => {
    const channels = styles.getPropertyValue(`--${name}`).trim();
    return channels ? `hsl(${channels})` : "#888";
  };
  return {
    ...(Object.fromEntries(TOKENS.map((t) => [t, resolve(t)])) as Record<Token, string>),
    series: Array.from({ length: SERIES }, (_, i) => resolve(`series-${i + 1}`)),
  };
}

export function useChartTheme(): ChartTheme {
  // The placeholder on the first render in the browser too, not a reading:
  // the server cannot read the document, and a first render that differs
  // from the page it hydrates is a mismatch. The effect reads it straight
  // after.
  const [theme, setTheme] = useState<ChartTheme>(placeholder);

  useEffect(() => {
    const update = () => setTheme(read());
    update();

    // The toggle sets data-theme on <html>…
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // …and with no override in place, the OS decides.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  return theme;
}
