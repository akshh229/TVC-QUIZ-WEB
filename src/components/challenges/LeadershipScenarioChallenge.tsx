// src/components/challenges/LeadershipScenarioChallenge.tsx
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface LeadershipScenarioChallengeProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function LeadershipScenarioChallenge({
  question,
  selected,
  onSelect,
  disabled,
}: LeadershipScenarioChallengeProps) {
  const options = question.options ?? [];

  return (
    <div>
      {/* Scenario framed as an editorial pull-quote */}
      <div className="relative max-w-3xl rounded-md border-l-4 border-forest bg-forest-soft px-6 py-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-forest">
          The situation
        </span>
        <p className="mt-2 font-serif text-xl leading-relaxed text-ink sm:text-2xl">
          {question.questionText}
        </p>
      </div>

      <p className="mt-6 text-sm font-medium text-ink/60">What would you do?</p>
      <div className="mt-3 grid gap-3" role="radiogroup" aria-label="Possible actions">
        {options.map((option, i) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={cn(
                "flex min-h-[60px] items-center gap-4 rounded-md border bg-card px-5 py-4 text-left text-base transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
                isSelected
                  ? "border-forest bg-forest-soft shadow-card"
                  : "border-ink/12 hover:border-ink/30 hover:bg-ink/[0.02]"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isSelected ? "border-forest bg-forest text-card" : "border-ink/20 text-ink/50"
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className={cn("leading-snug", isSelected ? "font-medium text-ink" : "text-ink/80")}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
