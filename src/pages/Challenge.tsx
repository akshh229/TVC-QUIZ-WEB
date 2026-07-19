// src/pages/Challenge.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { CategoryChip } from "@/components/CategoryChip";
import { Button } from "@/components/ui/button";
import { QuizChallenge } from "@/components/challenges/QuizChallenge";
import { GuessLeaderChallenge } from "@/components/challenges/GuessLeaderChallenge";
import {
  MatchPairChallenge,
  allPairsMatched,
  scorePairs,
  type PairSelections,
} from "@/components/challenges/MatchPairChallenge";
import { LeadershipScenarioChallenge } from "@/components/challenges/LeadershipScenarioChallenge";
import { useRandomQuestion, useSubmitAnswer } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";
import { useToast } from "@/components/ui/use-toast";

export default function Challenge() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const participantName = useGameStore((s) => s.participantName);
  const department = useGameStore((s) => s.department);
  const category = useGameStore((s) => s.selectedCategory);
  const setQuestion = useGameStore((s) => s.setQuestion);
  const setResult = useGameStore((s) => s.setResult);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pairSelections, setPairSelections] = useState<PairSelections>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: question, isLoading, isError, error, refetch } = useRandomQuestion(category);
  const submitAnswer = useSubmitAnswer();

  // Guards: session must have a name and a category.
  useEffect(() => {
    if (!participantName) {
      navigate("/participant", { replace: true });
    } else if (!category) {
      navigate("/spin", { replace: true });
    }
  }, [participantName, category, navigate]);

  useEffect(() => {
    if (question) setQuestion(question);
  }, [question, setQuestion]);

  if (!category || !participantName) return null;

  const isMatchPair = category === "match_pair";
  const canSubmit = question
    ? isMatchPair
      ? allPairsMatched(question, pairSelections)
      : !!selectedOption
    : false;

  const handleSubmit = async () => {
    if (!question || !canSubmit || submitting) return;
    setSubmitting(true);
    const isCorrect = isMatchPair
      ? scorePairs(question, pairSelections)
      : selectedOption === question.correctAnswer;

    setResult(isCorrect);
    try {
      await submitAnswer.mutateAsync({
        name: participantName,
        department: department || undefined,
        category,
        questionId: question.id,
        isCorrect,
        score: isCorrect ? 10 : 0,
      });
    } catch {
      // Recording failed (offline / db hiccup) — don't block the player.
      toast({
        title: "Couldn't save your play",
        description: "Your result still counts on screen — an organiser can re-check later.",
        variant: "destructive",
      });
    }
    navigate("/result");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-10 sm:px-10">
      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryChip category={category} />
          <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink/60">
            0 points
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm italic text-ink/45 sm:inline">
            {participantName}
          </span>
          <StepIndicator current={3} />
        </div>
      </div>

      {/* Body */}
      <div className="mt-10 flex-1">
        {isLoading && (
          <div
            className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-ink/50"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            <p className="text-sm">Preparing your challenge…</p>
          </div>
        )}

        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-sm text-ink/70">
              {error instanceof Error
                ? error.message
                : "We couldn't load a question right now."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => void refetch()}>
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
              <Button variant="ghost" onClick={() => navigate("/spin")}>
                Spin a different category
              </Button>
            </div>
          </div>
        )}

        {question && !isLoading && !isError && (
          <>
            {category === "quiz" && (
              <QuizChallenge
                question={question}
                selected={selectedOption}
                onSelect={setSelectedOption}
                disabled={submitting}
              />
            )}
            {category === "guess_leader" && (
              <GuessLeaderChallenge
                question={question}
                selected={selectedOption}
                onSelect={setSelectedOption}
                disabled={submitting}
              />
            )}
            {category === "match_pair" && (
              <MatchPairChallenge
                question={question}
                selections={pairSelections}
                onSelectionsChange={setPairSelections}
                disabled={submitting}
              />
            )}
            {category === "leadership_scenario" && (
              <LeadershipScenarioChallenge
                question={question}
                selected={selectedOption}
                onSelect={setSelectedOption}
                disabled={submitting}
              />
            )}
          </>
        )}
      </div>

      {/* Submit */}
      {question && !isLoading && !isError && (
        <div className="mt-10 flex justify-end border-t border-ink/10 pt-6">
          <Button
            size="lg"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || submitting}
            className="px-12"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Checking…
              </>
            ) : (
              "Submit answer"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
