"use client";

import Link from "next/link";
import { CalendarPlus, GitCompare, TrendingUp, UserPlus, Zap } from "lucide-react";
import { usePermission } from "@/lib/permission-utils";

const ACTIONS = [
  {
    href: "/matches/create",
    label: "Pick tonight's teams",
    hint: "Choose who is playing, then how to split them",
    Icon: Zap,
    /** The thing you open the app to do. */
    primary: true,
    manage: true,
  },
  {
    href: "/players/add",
    label: "Add a player",
    hint: "Someone new to the squad",
    Icon: UserPlus,
    manage: true,
  },
  {
    href: "/ratings",
    label: "Ratings",
    hint: "Who is rated where",
    Icon: TrendingUp,
  },
  {
    href: "/compare",
    label: "Compare two players",
    hint: "Side by side, and how they get on",
    Icon: GitCompare,
  },
  {
    href: "/seasons/create",
    label: "Start a season",
    hint: "A fresh table",
    Icon: CalendarPlus,
    manage: true,
  },
];

/**
 * The handful of things worth doing from the front page.
 *
 * Picking the teams comes first and is the only one styled as a primary
 * action, because it is what the app is opened for on a Tuesday. The rest are
 * shortcuts to pages the nav already lists — worth repeating here, since the
 * dashboard was otherwise a place you passed through on the way somewhere.
 */
export default function QuickActions() {
  const { canManage, ready } = usePermission();
  const editable = ready && canManage();

  const shown = ACTIONS.filter((action) => !action.manage || editable);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(({ href, label, hint, Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={`focus-ring group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
            primary
              ? "border-accent bg-accent/10 hover:bg-accent/15"
              : "border-border bg-surface hover:border-border-strong"
          }`}
        >
          <Icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${primary ? "text-accent" : "text-muted-foreground"}`}
          />
          <span className="min-w-0">
            <span className="block font-medium">{label}</span>
            <span className="block text-sm text-muted-foreground">{hint}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
