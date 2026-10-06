"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PAGES = [
  { path: "/ratings", label: "Ratings" },
  { path: "/lineups", label: "Line-up lab" },
  { path: "/compare", label: "Head to head" },
];

/**
 * The three ways into the squad's numbers, as one place with three rooms
 * rather than three entries in a menu: who is strongest, who plays well
 * together, and how two people measure up.
 */
export default function StatsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Stats" className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-1 rounded-full border border-border bg-surface p-1">
        {PAGES.map(({ path, label }) => {
          const active = pathname.startsWith(path);
          return (
            <li key={path}>
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
