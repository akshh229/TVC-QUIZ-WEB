// src/pages/admin/ParticipantLog.tsx
import { useMemo, useState } from "react";
import { Download, Loader2, Trophy, ListOrdered } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParticipants } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/types";
import { cn, exportCsv, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type View = "log" | "leaderboard";

export default function ParticipantLog() {
  const { toast } = useToast();
  const { data: participants = [], isLoading, isError, refetch } = useParticipants();
  const [view, setView] = useState<View>("log");

  const leaderboard = useMemo(
    () =>
      [...participants]
        .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
        .slice(0, 20),
    [participants]
  );

  const handleExport = () => {
    if (participants.length === 0) {
      toast({ title: "Nothing to export yet", variant: "default" });
      return;
    }
    exportCsv(
      participants.map((p) => ({
        name: p.name,
        department: p.department ?? "",
        category: CATEGORY_LABELS[p.category],
        correct: p.isCorrect ? "Yes" : "No",
        score: p.score,
        playedAt: p.playedAt,
      })),
      `spin-to-lead-participants-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "name", header: "Name" },
        { key: "department", header: "Department" },
        { key: "category", header: "Category" },
        { key: "correct", header: "Correct" },
        { key: "score", header: "Score" },
        { key: "playedAt", header: "Played at" },
      ]
    );
    toast({ title: "CSV exported", variant: "success" });
  };

  return (
    <AdminLayout title="Participants" description="Every play from the stall, plus the leaderboard.">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-ink/15 bg-card p-1" role="tablist" aria-label="View">
          <button
            type="button"
            role="tab"
            aria-selected={view === "log"}
            onClick={() => setView("log")}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded px-4 text-sm font-medium transition-colors",
              view === "log" ? "bg-ink text-ivory" : "text-ink/60 hover:text-ink"
            )}
          >
            <ListOrdered className="h-4 w-4" aria-hidden="true" /> Full log
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "leaderboard"}
            onClick={() => setView("leaderboard")}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded px-4 text-sm font-medium transition-colors",
              view === "leaderboard" ? "bg-ink text-ivory" : "text-ink/60 hover:text-ink"
            )}
          >
            <Trophy className="h-4 w-4" aria-hidden="true" /> Leaderboard
          </button>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download aria-hidden="true" /> Export CSV
        </Button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-ink/50" role="status">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading participants</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-terracotta/30 bg-terracotta-soft px-4 py-8 text-center">
            <p className="text-sm text-terracotta">Couldn't load participants.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && participants.length === 0 && (
          <div className="rounded-lg border border-dashed border-ink/20 bg-card/60 px-6 py-14 text-center">
            <p className="font-serif text-lg text-ink/70">No plays recorded yet.</p>
            <p className="mt-1 text-sm text-ink/50">
              Results will stream in as students play at the stall.
            </p>
          </div>
        )}

        {!isLoading && !isError && participants.length > 0 && view === "log" && (
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-ink">{p.name}</TableCell>
                    <TableCell className="text-ink/60">{p.department || "—"}</TableCell>
                    <TableCell className="text-ink/70">{CATEGORY_LABELS[p.category]}</TableCell>
                    <TableCell>
                      <Badge variant={p.isCorrect ? "forest" : "muted"}>
                        {p.isCorrect ? "Correct" : "Missed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-ink">{p.score}</TableCell>
                    <TableCell className="text-right text-ink/55">{formatDate(p.playedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && participants.length > 0 && view === "leaderboard" && (
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-card shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          i === 0
                            ? "bg-marigold text-ink"
                            : i < 3
                              ? "bg-marigold-soft text-ink"
                              : "bg-ink/5 text-ink/50"
                        )}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-ink">{p.name}</TableCell>
                    <TableCell className="text-ink/60">{p.department || "—"}</TableCell>
                    <TableCell className="text-ink/70">{CATEGORY_LABELS[p.category]}</TableCell>
                    <TableCell className="text-right font-serif text-xl text-ink">
                      {p.score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
