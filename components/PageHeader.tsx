import type { ReactNode } from "react";

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
  title,
  subtitle,
  badges,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Status pills, shown beside the title. */
  badges?: ReactNode;
  /** Buttons, which drop below the title on a phone. */
  actions?: ReactNode;
  /** Anything else, under the subtitle. Stat tiles, usually. */
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
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
