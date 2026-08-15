import { Suspense } from "react";
import {
  Dices,
  Handshake,
  LineChart,
  Trophy,
} from "lucide-react";
import LoginForm from "@/components/LoginForm";

const FEATURES = [
  {
    Icon: Dices,
    title: "Pick the sides",
    body: "Shuffle them, or even them up by rating, recent form or the level you set yourself.",
  },
  {
    Icon: Trophy,
    title: "Keep a table",
    body: "Seasons, points and a champion. Everything is worked out from the results, so nothing can fall out of step.",
  },
  {
    Icon: LineChart,
    title: "Rate everyone",
    body: "Elo adapted for five-a-side, so the ladder keeps up with who is actually turning out.",
  },
  {
    Icon: Handshake,
    title: "Find out who works together",
    body: "Who you win with and who you come unstuck against — measured against your own average, not off one lucky night.",
  },
];

/**
 * Signing in, and what it is you would be signing in to.
 *
 * The form used to be alone on the page under the word "Login", which told
 * somebody arriving from a shared link precisely nothing. The explanation sits
 * beside it on a desktop and above it on a phone, so the form is still the
 * first thing in reach where the screen is small.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-10 md:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">The Dugout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Five-a-side, settled.
          </h1>
          <p className="mt-3 max-w-prose text-muted-foreground">
            Keep the results, split the teams fairly, and put an end to the
            argument about who is actually any good.
          </p>

          <ul className="mt-8 space-y-5">
            {FEATURES.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <h2 className="font-medium">{title}</h2>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-muted-foreground">
            Free, and yours. Create a team, invite whoever you play with, and
            nobody outside it can see a thing.
          </p>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          {/*
           * The form reads `?next=` to decide where to send you after signing
           * in, and `useSearchParams` opts its whole subtree into dynamic
           * rendering. Wrapping it keeps that boundary here rather than
           * bubbling out to the root layout.
           */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
