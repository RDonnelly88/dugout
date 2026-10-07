"use client";

import { usePathname } from "next/navigation";
import { ArrowLeftRight, FlaskConical, TrendingUp } from "lucide-react";
import PageTabs, { type PageTab } from "@/components/PageTabs";

const PAGES: PageTab[] = [
  { value: "/ratings", href: "/ratings", label: "Ratings", icon: TrendingUp },
  { value: "/lineups", href: "/lineups", label: "Line-up lab", icon: FlaskConical },
  { value: "/compare", href: "/compare", label: "Head to head", icon: ArrowLeftRight },
];

/**
 * The three ways into the squad's numbers, as one place with three rooms:
 * who is strongest, who plays well together, and how two people measure up.
 */
export default function StatsNav() {
  const pathname = usePathname();
  const value = PAGES.find((page) => pathname.startsWith(page.value))?.value ?? "";
  return <PageTabs tabs={PAGES} value={value} label="Stats" atTop />;
}
