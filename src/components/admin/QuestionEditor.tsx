// src/components/admin/QuestionEditor.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadImage } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABELS, type Category, type MatchPair, type Question, type QuestionInput } from "@/lib/types";

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing question when editing; null when adding. */
  question: Question | null;
  onSave: (input: QuestionInput) => Promise<void>;
  saving: boolean;
}

interface FormState {
  category: Category;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
  pairs: MatchPair[];
  explanation: string;
  imageUrl: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  category: "quiz",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  pairs: [
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
  ],
  explanation: "",
  imageUrl: "",
  isActive: true,
};

function fromQuestion(q: Question): FormState {
  const opts = q.options ?? [];
  return {
    category: q.category,
    questionText: q.questionText,
    options: [opts[0] ?? "", opts[1] ?? "", opts[2] ?? "", opts[3] ?? ""],
    correctAnswer: q.correctAnswer ?? "",
    pairs:
      q.pairs && q.pairs.length >= 4
        ? q.pairs.map((p) => ({ ...p }))
        : [...(q.pairs ?? []).map((p) => ({ ...p })), ...EMPTY_FORM.pairs].slice(0, Math.max(4, q.pairs?.length ?? 0)),
    explanation: q.explanation ?? "",
    imageUrl: q.imageUrl ?? "",
    isActive: q.isActive,
  };
}

export function QuestionEditor({ open, onOpenChange, question, onSave, saving }: QuestionEditorProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (open) {
      setForm(question ? fromQuestion(question) : { ...EMPTY_FORM, pairs: EMPTY_FORM.pairs.map((p) => ({ ...p })) });
      setValidationError(null);
    }
  }, [open, question]);

  const isMatchPair = form.category === "match_pair";
  const isGuessLeader = form.category === "guess_leader";

  const filledOptions = useMemo(
    () => form.options.map((o) => o.trim()).filter(Boolean),
    [form.options]
  );

  const validate = (): string | null => {
    if (!form.questionText.trim()) return "Question text is required.";
    if (isMatchPair) {
      const complete = form.pairs.filter((p) => p.left.trim() && p.right.trim());
      if (complete.length < 4) return "Match the Pair needs at least 4 complete pairs.";
      const lefts = new Set(complete.map((p) => p.left.trim()));
      const rights = new Set(complete.map((p) => p.right.trim()));
      if (lefts.size !== complete.length || rights.size !== complete.length)
        return "Pair entries must be unique on both sides.";
      return null;
    }
    if (filledOptions.length !== 4) return "All 4 options are required.";
    if (new Set(filledOptions).size !== 4) return "Options must be unique.";
    if (!form.correctAnswer || !filledOptions.includes(form.correctAnswer))
      return "Pick which option is the correct answer.";
    return null;
  };

  const handleSave = async () => {
    const problem = validate();
    if (problem) {
      setValidationError(problem);
      return;
    }
    setValidationError(null);
    const input: QuestionInput = {
      category: form.category,
      questionText: form.questionText.trim(),
      isActive: form.isActive,
      explanation: form.explanation.trim() || undefined,
      ...(isMatchPair
        ? {
            pairs: form.pairs
              .filter((p) => p.left.trim() && p.right.trim())
              .map((p) => ({ left: p.left.trim(), right: p.right.trim() })),
          }
        : {
            options: form.options.map((o) => o.trim()) as string[],
            correctAnswer: form.correctAnswer,
          }),
      ...(isGuessLeader ? { imageUrl: form.imageUrl || undefined } : {}),
    };
    await onSave(input);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const item = await uploadImage.mutateAsync(file);
      setForm((f) => ({ ...f, imageUrl: item.url }));
    } catch (err) {
      setValidationError(
        err instanceof Error ? `Image upload failed: ${err.message}` : "Image upload failed."
      );
    }
  };

  const setOption = (index: number, value: string) => {
    setForm((f) => {
      const options = [...f.options] as FormState["options"];
      const prev = options[index];
      options[index] = value;
      return {
        ...f,
        options,
        // Keep correctAnswer in sync if its text was edited.
        correctAnswer: f.correctAnswer === prev ? value : f.correctAnswer,
      };
    });
  };

  const setPair = (index: number, side: keyof MatchPair, value: string) => {
    setForm((f) => {
      const pairs = f.pairs.map((p, i) => (i === index ? { ...p, [side]: value } : p));
      return { ...f, pairs };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{question ? "Edit question" : "Add a question"}</DialogTitle>
          <DialogDescription>
            {question
              ? "Changes apply the next time this question is served."
              : "New questions are served to participants as soon as they're active."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category + status */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="q-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                disabled={!!question}
              >
                <SelectTrigger id="q-category" aria-label="Question category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {question && (
                <p className="text-xs text-ink/45">
                  Category can't change after creation — duplicate instead.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch
                id="q-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="q-active" className="cursor-pointer">
                {form.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-2">
            <Label htmlFor="q-text">
              {isMatchPair ? "Instruction shown to the player" : "Question text"}
            </Label>
            <Textarea
              id="q-text"
              value={form.questionText}
              onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
              placeholder={
                isMatchPair
                  ? "e.g., Match each leader with their achievement."
                  : "Type the question…"
              }
            />
          </div>

          {/* Guess the Leader image */}
          {isGuessLeader && (
            <div className="space-y-2">
              <Label>Leader image</Label>
              {form.imageUrl ? (
                <div className="flex items-start gap-4">
                  <img
                    src={form.imageUrl}
                    alt="Leader preview"
                    className="h-28 w-24 rounded-md border border-ink/10 object-cover"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => void handleUpload(e.target.files?.[0])}
                        aria-label="Replace leader image"
                      />
                      <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-ink/20 px-3 text-sm font-medium hover:bg-ink/5">
                        <Upload className="h-4 w-4" aria-hidden="true" /> Replace
                      </span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start text-terracotta hover:bg-terracotta-soft hover:text-terracotta"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    >
                      <X aria-hidden="true" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink/25 bg-ivory/60 px-6 py-8 text-ink/50 transition-colors hover:border-ink/40 hover:text-ink/70">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => void handleUpload(e.target.files?.[0])}
                    aria-label="Upload leader image"
                  />
                  {uploadImage.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="h-6 w-6" aria-hidden="true" />
                  )}
                  <span className="text-sm font-medium">
                    {uploadImage.isPending ? "Uploading…" : "Upload an image"}
                  </span>
                  <span className="text-xs">A portrait works best (4:5)</span>
                </label>
              )}
            </div>
          )}

          {/* Options or pairs */}
          {isMatchPair ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Leader ↔ Achievement pairs (minimum 4)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({ ...f, pairs: [...f.pairs, { left: "", right: "" }] }))
                  }
                >
                  <Plus aria-hidden="true" /> Add pair
                </Button>
              </div>
              <div className="space-y-2">
                {form.pairs.map((pair, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <Input
                      value={pair.left}
                      onChange={(e) => setPair(i, "left", e.target.value)}
                      placeholder={`Leader ${i + 1}`}
                      aria-label={`Pair ${i + 1} leader`}
                    />
                    <Input
                      value={pair.right}
                      onChange={(e) => setPair(i, "right", e.target.value)}
                      placeholder="Achievement"
                      aria-label={`Pair ${i + 1} achievement`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-ink/40 hover:text-terracotta"
                      onClick={() =>
                        setForm((f) => ({ ...f, pairs: f.pairs.filter((_, j) => j !== i) }))
                      }
                      disabled={form.pairs.length <= 4}
                      aria-label={`Remove pair ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Options — tap the letter to mark the correct answer</Label>
              <div className="space-y-2">
                {form.options.map((option, i) => {
                  const isCorrect = !!option.trim() && form.correctAnswer === option;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          option.trim() && setForm((f) => ({ ...f, correctAnswer: option }))
                        }
                        className={
                          isCorrect
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-card"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 text-sm font-semibold text-ink/50 hover:border-forest hover:text-forest"
                        }
                        aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}
                        aria-pressed={isCorrect}
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                      <Input
                        value={option}
                        onChange={(e) => setOption(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        aria-label={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-ink/45">
                {form.correctAnswer
                  ? `Correct answer: ${form.correctAnswer}`
                  : "No correct answer marked yet."}
              </p>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="q-explanation">
              Explanation / fun fact{" "}
              <span className="text-xs font-normal text-ink/40">(optional, shown after the result)</span>
            </Label>
            <Textarea
              id="q-explanation"
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              placeholder="A line of context that makes the answer memorable…"
              className="min-h-[72px]"
            />
          </div>

          {validationError && (
            <p className="rounded-md border border-terracotta/30 bg-terracotta-soft px-4 py-2.5 text-sm text-terracotta" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : question ? (
              "Save changes"
            ) : (
              "Add question"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
