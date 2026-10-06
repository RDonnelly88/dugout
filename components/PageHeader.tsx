"use client";

import type { ReactNode } from "react";
import { useTeam } from "@/contexts/TeamContext";

/**
 * The top of a page: what it is, what it is for, and what you can do here.
 *
 * One component because there were eight arrangements of the same three
 * things. Titles ran from `text-2xl` to `text-3xl`, some pages centred the
 * subtitle under a left-aligned heading, some put the actions above the title
 * and some beside it, and the season page wrapped the lot in a card so it sat
 * in a box no other page had.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  badges,
  actions,
  children,
}: {
  /** The line above the title. The team's own name unless a page says otherwise. */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Status pills, shown beside the title. */
  badges?: ReactNode;
  /** Buttons, which drop below the title on a phone. */
  actions?: ReactNode;
  /** Anything else, under the subtitle. Stat tiles, usually. */
  children?: ReactNode;
}) {
  const { currentTeam } = useTeam();
  const kicker = eyebrow ?? currentTeam?.name;

  return (
    <div className="page-header">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {/* The team's name is already in the bar above on a phone. */}
          {kicker && (
            <p className={`page-kicker mb-3 ${eyebrow ? "" : "hidden md:block"}`}>{kicker}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="page-title">{title}</h1>
            {badges}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
