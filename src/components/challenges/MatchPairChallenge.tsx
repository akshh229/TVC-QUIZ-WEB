// src/components/challenges/MatchPairChallenge.tsx
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, shuffle } from "@/lib/utils";
import type { Question } from "@/lib/types";

export type PairSelections = Record<string, string>;

interface MatchPairChallengeProps {
  question: Question;
  selections: PairSelections;
  onSelectionsChange: (next: PairSelections) => void;
  disabled?: boolean;
}

/**
 * Accessible matching: each leader (left) gets a dropdown of achievements
 * (right values, shuffled once). Submit is enabled by the parent when all
 * pairs have a selection.
 */
export function MatchPairChallenge({
  question,
  selections,
  onSelectionsChange,
  disabled,
}: MatchPairChallengeProps) {
  const pairs = useMemo(() => question.pairs ?? [], [question.pairs]);
  // Shuffle right-side options once per question so order doesn't give it away.
  const rightOptions = useMemo(
    () => shuffle(pairs.map((p) => p.right)),
    [pairs]
  );

  return (
    <div>
      <h2 className="max-w-2xl font-serif text-2xl leading-snug text-ink sm:text-3xl">
        {question.questionText}
      </h2>
      <p className="mt-2 text-sm text-ink/55">
        Pick the matching achievement for each leader.
      </p>

      <div className="mt-8 space-y-3">
        {pairs.map((pair, index) => {
          const value = selections[pair.left] ?? "";
          const isMatched = !!value;
          const selectId = `pair-select-${index}`;
          return (
            <div
              key={pair.left}
              className={cn(
                "grid items-center gap-2 rounded-md border bg-card p-5 sm:grid-cols-[1fr_auto_1.4fr] sm:gap-4",
                isMatched
                  ? "border-l-4 border-forest/60 border-y-ink/12 border-r-ink/12"
                  : "border-ink/12"
              )}
            >
              <div className="min-w-0">
                <label
                  htmlFor={selectId}
                  className="font-medium leading-snug text-ink"
                >
                  {pair.left}
                </label>
                {isMatched && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-forest-soft px-2.5 py-0.5 text-xs font-medium text-forest sm:hidden">
                    {value}
                  </span>
                )}
              </div>
              <span aria-hidden="true" className="hidden text-ink/30 sm:block">
                →
              </span>
              <Select
                value={value}
                disabled={disabled}
                onValueChange={(next) =>
                  onSelectionsChange({ ...selections, [pair.left]: next })
                }
              >
                <SelectTrigger id={selectId} aria-label={`Match for ${pair.left}`}>
                  <SelectValue placeholder="Choose an achievement…" />
                </SelectTrigger>
                <SelectContent>
                  {rightOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** All leaders matched → true when every pair has a selection. */
export function allPairsMatched(question: Question, selections: PairSelections): boolean {
  const pairs = question.pairs ?? [];
  return pairs.length > 0 && pairs.every((p) => !!selections[p.left]);
}

/** Correct when every leader is matched to their own achievement. */
export function scorePairs(question: Question, selections: PairSelections): boolean {
  const pairs = question.pairs ?? [];
  return pairs.every((p) => selections[p.left] === p.right);
}
