// src/pages/admin/QuestionManagement.tsx
import { useMemo, useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionTable } from "@/components/admin/QuestionTable";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Question, type QuestionInput } from "@/lib/types";

type CategoryFilter = Category | "all";
type StatusFilter = "all" | "active" | "inactive";

export default function QuestionManagement() {
  const { toast } = useToast();
  const { data: questions = [], isLoading, isError, refetch } = useQuestions();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
      if (statusFilter === "active" && !q.isActive) return false;
      if (statusFilter === "inactive" && q.isActive) return false;
      if (term) {
        const haystack = [
          q.questionText,
          ...(q.options ?? []),
          ...(q.pairs ?? []).flatMap((p) => [p.left, p.right]),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [questions, search, categoryFilter, statusFilter]);

  const handleSave = async (input: QuestionInput) => {
    try {
      if (editing) {
        await updateQuestion.mutateAsync({ id: editing.id, input });
        toast({ title: "Question updated", variant: "success" });
      } else {
        await createQuestion.mutateAsync(input);
        toast({ title: "Question added", variant: "success" });
      }
      setEditorOpen(false);
      setEditing(null);
    } catch (err) {
      toast({
        title: "Couldn't save the question",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (q: Question) => {
    setBusyId(q.id);
    try {
      await updateQuestion.mutateAsync({
        id: q.id,
        input: { ...q, isActive: !q.isActive },
      });
      toast({
        title: q.isActive ? "Question deactivated" : "Question activated",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Couldn't update the question",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (q: Question) => {
    setBusyId(q.id);
    try {
      await createQuestion.mutateAsync({
        category: q.category,
        questionText: `${q.questionText} (copy)`,
        imageUrl: q.imageUrl,
        options: q.options ? [...q.options] : undefined,
        correctAnswer: q.correctAnswer,
        pairs: q.pairs ? q.pairs.map((p) => ({ ...p })) : undefined,
        explanation: q.explanation,
        isActive: false,
      });
      toast({ title: "Question duplicated", description: "The copy starts inactive.", variant: "success" });
    } catch (err) {
      toast({
        title: "Couldn't duplicate the question",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteQuestion.mutateAsync(deleting.id);
      toast({ title: "Question deleted", variant: "success" });
      setDeleting(null);
    } catch (err) {
      toast({
        title: "Couldn't delete the question",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Questions" description="Add, edit, and curate the challenge pool.">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="pl-10"
            aria-label="Search questions"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <SelectTrigger className="sm:w-52" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Plus aria-hidden="true" /> Add question
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-ink/50" role="status">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading questions</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-terracotta/30 bg-terracotta-soft px-4 py-8 text-center">
            <p className="text-sm text-terracotta">Couldn't load questions.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!isLoading && !isError && (
          <>
            <p className="mb-3 text-xs text-ink/45">
              {filtered.length} of {questions.length} questions
            </p>
            <QuestionTable
              questions={filtered}
              busyId={busyId}
              onEdit={(q) => {
                setEditing(q);
                setEditorOpen(true);
              }}
              onDelete={setDeleting}
              onToggleActive={(q) => void handleToggleActive(q)}
              onDuplicate={(q) => void handleDuplicate(q)}
            />
          </>
        )}
      </div>

      {/* Add/edit modal */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditing(null);
        }}
        question={editing}
        onSave={handleSave}
        saving={createQuestion.isPending || updateQuestion.isPending}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this question?</DialogTitle>
            <DialogDescription className="line-clamp-3">
              "{deleting?.questionText}" will be removed permanently. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteQuestion.isPending}
            >
              {deleteQuestion.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Deleting…
                </>
              ) : (
                "Delete question"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
