// src/components/challenges/GuessLeaderChallenge.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface GuessLeaderChallengeProps {
  question: Question;
  selected: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function GuessLeaderChallenge({
  question,
  selected,
  onSelect,
  disabled,
}: GuessLeaderChallengeProps) {
  const options = question.options ?? [];
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!question.imageUrl && !imageFailed;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      {/* Framed portrait */}
      <figure className="mx-auto w-full max-w-sm">
        <div className="rounded-lg border border-ink/12 bg-card p-3 shadow-card">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-clay/20">
            {hasImage ? (
              <img
                src={question.imageUrl}
                alt="A leader to identify"
                className="h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink/30">
                <UserRound className="h-20 w-20" strokeWidth={1} aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-[0.18em]">
                  Portrait coming soon
                </span>
              </div>
            )}
          </div>
        </div>
        <figcaption className="mt-3 text-center text-xs italic text-ink/40">
          Study the portrait, then choose below.
        </figcaption>
      </figure>

      {/* Question + options */}
      <div>
        <h2 className="font-serif text-2xl leading-snug text-ink sm:text-3xl">
          {question.questionText || "Who is this?"}
        </h2>
        <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
          {options.map((option, i) => {
            const isSelected = selected === option;
            return (
              <motion.button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => {
                  onSelect(option);
                  navigator.vibrate?.(8);
                }}
                className={cn(
                  "flex min-h-[72px] items-center gap-4 rounded-md border bg-card px-5 py-3.5 text-left text-base transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
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
                <span
                  className={cn("leading-snug", isSelected ? "font-medium text-ink" : "text-ink/80")}
                >
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
