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

type Token = (typeof TOKENS)[number];
export type ChartTheme = Record<Token, string>;

function read(): ChartTheme {
  if (typeof window === "undefined") {
    return Object.fromEntries(TOKENS.map((t) => [t, "#888"])) as ChartTheme;
  }
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    TOKENS.map((t) => {
      const channels = styles.getPropertyValue(`--${t}`).trim();
      return [t, channels ? `hsl(${channels})` : "#888"];
    })
  ) as ChartTheme;
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(read);

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
