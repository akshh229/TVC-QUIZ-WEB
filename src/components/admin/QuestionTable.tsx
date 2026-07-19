// src/components/admin/QuestionTable.tsx
import { Pencil, Trash2, Copy, Power } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryChip } from "@/components/CategoryChip";
import type { Question } from "@/lib/types";

interface QuestionTableProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onToggleActive: (question: Question) => void;
  onDuplicate: (question: Question) => void;
  busyId?: string | null;
}

export function QuestionTable({
  questions,
  onEdit,
  onDelete,
  onToggleActive,
  onDuplicate,
  busyId,
}: QuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/20 bg-card/60 px-6 py-14 text-center">
        <p className="font-serif text-lg text-ink/70">No questions match.</p>
        <p className="mt-1 text-sm text-ink/50">
          Adjust the filters, or add a new question to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[280px]">Question</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => {
            const busy = busyId === q.id;
            return (
              <TableRow key={q.id} className={busy ? "opacity-50" : undefined}>
                <TableCell>
                  <p className="line-clamp-2 max-w-md font-medium leading-snug text-ink">
                    {q.questionText}
                  </p>
                  {q.category === "match_pair" && (
                    <p className="mt-0.5 text-xs text-ink/45">{q.pairs?.length ?? 0} pairs</p>
                  )}
                </TableCell>
                <TableCell>
                  <CategoryChip category={q.category} />
                </TableCell>
                <TableCell>
                  <Badge variant={q.isActive ? "forest" : "muted"}>
                    {q.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onToggleActive(q)}
                      disabled={busy}
                      aria-label={q.isActive ? `Deactivate question` : `Activate question`}
                      title={q.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onDuplicate(q)}
                      disabled={busy}
                      aria-label="Duplicate question"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onEdit(q)}
                      disabled={busy}
                      aria-label="Edit question"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-terracotta hover:bg-terracotta-soft hover:text-terracotta"
                      onClick={() => onDelete(q)}
                      disabled={busy}
                      aria-label="Delete question"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
