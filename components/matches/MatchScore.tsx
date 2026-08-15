"use client";

import { Check, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf, type Outcome } from "@/lib/match-result";
import { Match } from "@/types";
import { UseMutationResult } from "@tanstack/react-query";

interface MatchScoreProps {
  match: Match;
  isCompleted: boolean;
  isEditing: boolean;
  setOutcome: (outcome: Outcome) => void;
  /** What will actually be saved: the score decides when it is given. */
  effectiveOutcome: Outcome | null;
  teamAScore: number | undefined;
  teamBScore: number | undefined;
  onScoreChange: {
    teamA: (value: number | undefined) => void;
    teamB: (value: number | undefined) => void;
  };
  onCancel: () => void;
  onSave: () => void;
  updateMatchMutation: UseMutationResult<any, any, any, any>;
}

/**
 * The result of a match, and recording one.
 *
 * Who won is the result. The score is optional, because five-a-side is mostly
 * remembered as "we won" rather than as 6–4 — and when it is given it decides
 * the result rather than sitting beside it, so the two can never disagree.
 */
const MatchScore = ({
  match,
  isCompleted,
  isEditing,
  setOutcome,
  effectiveOutcome,
  teamAScore,
  teamBScore,
  onScoreChange,
  onCancel,
  onSave,
  updateMatchMutation,
}: MatchScoreProps) => {
  const sides = useSideNames();
  const nameFor = (key: Outcome) => (key === "a" ? sides.A : sides.B);

  if (isCompleted && !isEditing) {
    const settled = outcomeOf(match);
    const hasScore =
      typeof match.teamA?.score === "number" &&
      typeof match.teamB?.score === "number";

    return (
      <div className="mb-4 rounded-xl bg-surface-2/40 p-6 text-center">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <h3 className="flex-1 text-xl font-bold md:text-right">{sides.A}</h3>
          <div className="tabular px-6 text-4xl font-bold">
            {hasScore ? (
              <>
                {match.teamA.score} – {match.teamB.score}
              </>
            ) : (
              <span className="text-2xl text-muted-foreground">v</span>
            )}
          </div>
          <h3 className="flex-1 text-xl font-bold md:text-left">{sides.B}</h3>
        </div>

        {settled === "draw" ? (
          <p className="mt-4 inline-flex items-center rounded-full bg-info/10 px-4 py-2 font-medium text-info">
            Honours even
          </p>
        ) : settled ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-win/10 px-4 py-2 font-medium text-win">
            <Trophy className="h-4 w-4" />
            {nameFor(settled)} won
          </p>
        ) : null}
      </div>
    );
  }

  if (isEditing) {
    const scored =
      teamAScore !== undefined && teamBScore !== undefined;

    const options: { key: Outcome; label: string }[] = [
      { key: "a", label: `${sides.A} won` },
      { key: "draw", label: "Draw" },
      { key: "b", label: `${sides.B} won` },
    ];

    return (
      <div className="mb-4 rounded-xl bg-surface-2/40 p-6">
        <h3 className="section-title mb-4 text-center">How did it go?</h3>

        <fieldset className="grid gap-2 sm:grid-cols-3">
          <legend className="sr-only">The result</legend>
          {options.map(({ key, label }) => {
            const selected = effectiveOutcome === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setOutcome(key)}
                aria-pressed={selected}
                className={`focus-ring rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface hover:border-border-strong"
                }`}
              >
                {label}
              </button>
            );
          })}
        </fieldset>

        <div className="mt-5">
          <p className="eyebrow mb-2 text-center">Score, if you remember it</p>
          <div className="flex items-end justify-center gap-3">
            <div className="w-24">
              <Label htmlFor="score-a" className="block text-center text-xs">
                {sides.A}
              </Label>
              <Input
                id="score-a"
                type="number"
                min="0"
                inputMode="numeric"
                value={teamAScore ?? ""}
                onChange={(e) =>
                  onScoreChange.teamA(
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10)
                  )
                }
                className="tabular mt-1 text-center text-lg font-bold"
              />
            </div>
            <span className="pb-2.5 text-muted-foreground">–</span>
            <div className="w-24">
              <Label htmlFor="score-b" className="block text-center text-xs">
                {sides.B}
              </Label>
              <Input
                id="score-b"
                type="number"
                min="0"
                inputMode="numeric"
                value={teamBScore ?? ""}
                onChange={(e) =>
                  onScoreChange.teamB(
                    e.target.value === "" ? undefined : parseInt(e.target.value, 10)
                  )
                }
                className="tabular mt-1 text-center text-lg font-bold"
              />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {scored
              ? "The score sets the result."
              : "Leave it blank and the result still counts."}
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!effectiveOutcome || updateMatchMutation.isPending}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            {updateMatchMutation.isPending ? "Saving…" : "Save result"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl bg-surface-2/40 p-6 text-center">
      <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
        <h3 className="flex-1 text-xl font-bold md:text-right">{sides.A}</h3>
        <span className="px-6 text-xl font-medium text-muted-foreground">v</span>
        <h3 className="flex-1 text-xl font-bold md:text-left">{sides.B}</h3>
      </div>
      <p className="mt-4 text-muted-foreground">Not played yet</p>
    </div>
  );
};

export default MatchScore;
