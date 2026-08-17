"use client";

import { useEffect, useState, useTransition } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { saveThemePreference } from "@/app/actions";
import {
  THEME_STORAGE_KEY,
  isThemeChoice,
  type ThemeChoice,
} from "@/lib/theme";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Writes the choice to three places, for three different reasons:
 *
 * - the `data-theme` attribute, so it applies instantly
 * - `localStorage`, so it survives a reload before the server responds, and
 *   still works signed out
 * - the account, so it follows you to another device
 */
export default function ThemeToggle({
  /** Server-rendered from the account. Beats anything stored locally. */
  initial,
}: {
  initial?: ThemeChoice | null;
}) {
  const [choice, setChoice] = useState<ThemeChoice>(initial ?? "system");
  // Until this is true the control renders unpressed, because the server has
  // no way to know what this browser last chose and guessing produces a
  // hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [, startSaving] = useTransition();

  useEffect(() => {
    if (!initial) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeChoice(stored)) setChoice(stored);
    } else {
      // Keep the local copy in step with the account, so a browser holding an
      // older value doesn't briefly apply it on the next load.
      if (initial === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, initial);
    }
    setMounted(true);
  }, [initial]);

  function apply(next: ThemeChoice) {
    setChoice(next);

    if (next === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
    }

    // Fire and forget: the page has already changed, and a failed write only
    // means the choice stays in this browser.
    startSaving(async () => {
      await saveThemePreference(next);
    });
  }

  return (
    <SegmentedControl
      label="Colour theme"
      // Unpressed until mounted: the server cannot know what this browser last
      // chose, and guessing produces a hydration mismatch.
      value={mounted ? choice : ""}
      onValueChange={(next) => apply(next as ThemeChoice)}
      className="p-0.5"
      aria-busy={!mounted}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <SegmentedControlItem
          key={value}
          value={value}
          title={label}
          className="h-8 w-8 justify-center hover:text-accent"
        >
          <Icon size={14} aria-hidden />
          <span className="sr-only">{label}</span>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
