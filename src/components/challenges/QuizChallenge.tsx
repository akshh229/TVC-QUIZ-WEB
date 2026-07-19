// src/components/challenges/QuizChallenge.tsx
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface QuizChallengeProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function QuizChallenge({ question, selected, onSelect, disabled }: QuizChallengeProps) {
  const options = question.options ?? [];

  return (
    <div>
      <h2 className="max-w-2xl font-serif text-2xl leading-snug text-ink sm:text-3xl">
        {question.questionText}
      </h2>
      <div
        className="mt-8 grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Answer options"
      >
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
                "flex min-h-[64px] items-center gap-4 rounded-md border bg-card px-5 py-4 text-left text-base transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
                isSelected
                  ? "border-terracotta bg-terracotta-soft shadow-card"
                  : "border-ink/12 hover:border-ink/30 hover:bg-ink/[0.02]"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isSelected
                    ? "border-terracotta bg-terracotta text-card"
                    : "border-ink/20 text-ink/50"
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
