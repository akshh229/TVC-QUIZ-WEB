// src/pages/admin/AdminDashboard.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ListChecks, CircleCheck, Users, Trophy, Loader2, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryChip } from "@/components/CategoryChip";
import { useQuestions, useParticipants } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { isMockMode } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const questionsQuery = useQuestions();
  const participantsQuery = useParticipants();

  const questions = questionsQuery.data ?? [];
  const participants = participantsQuery.data ?? [];

  const stats = useMemo(() => {
    const active = questions.filter((q) => q.isActive);
    const byCategory = CATEGORIES.map((c) => ({
      category: c,
      total: questions.filter((q) => q.category === c).length,
      active: active.filter((q) => q.category === c).length,
    }));
    return {
      total: questions.length,
      active: active.length,
      byCategory,
      plays: participants.length,
      correct: participants.filter((p) => p.isCorrect).length,
    };
  }, [questions, participants]);

  const loading = questionsQuery.isLoading || participantsQuery.isLoading;
  const failed = questionsQuery.isError || participantsQuery.isError;
  const recent = participants.slice(0, 6);

  return (
    <AdminLayout
      title="Dashboard"
      description={
        isMockMode
          ? "Demo mode — data lives in memory and resets on reload."
          : "Live overview of questions and plays."
      }
    >
      {loading && (
        <div className="flex min-h-[200px] items-center justify-center text-ink/50" role="status">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading dashboard</span>
        </div>
      )}

      {failed && !loading && (
        <p className="rounded-md border border-terracotta/30 bg-terracotta-soft px-4 py-3 text-sm text-terracotta">
          Couldn't load dashboard data. Check your connection and refresh.
        </p>
      )}

      {!loading && !failed && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink/5">
                  <ListChecks className="h-5 w-5 text-ink/60" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-3xl leading-none text-ink">{stats.total}</p>
                  <p className="mt-1 text-xs text-ink/55">Total questions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-forest-soft">
                  <CircleCheck className="h-5 w-5 text-forest" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-3xl leading-none text-ink">{stats.active}</p>
                  <p className="mt-1 text-xs text-ink/55">Active questions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-terracotta-soft">
                  <Users className="h-5 w-5 text-terracotta" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-3xl leading-none text-ink">{stats.plays}</p>
                  <p className="mt-1 text-xs text-ink/55">Total plays</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-marigold-soft">
                  <Trophy className="h-5 w-5 text-ink" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-3xl leading-none text-ink">{stats.correct}</p>
                  <p className="mt-1 text-xs text-ink/55">Correct answers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown + recent activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg text-ink">Questions by category</h2>
                  <Link
                    to="/admin/questions"
                    className="inline-flex items-center gap-1 text-xs font-medium text-terracotta underline-offset-4 hover:underline"
                  >
                    Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {stats.byCategory.map(({ category, total, active }) => (
                    <li key={category} className="flex items-center justify-between gap-4">
                      <CategoryChip category={category} />
                      <span className="text-sm text-ink/60">
                        <span className="font-semibold text-ink">{active}</span> active · {total}{" "}
                        total
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg text-ink">Recent plays</h2>
                  <Link
                    to="/admin/participants"
                    className="inline-flex items-center gap-1 text-xs font-medium text-terracotta underline-offset-4 hover:underline"
                  >
                    View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <p className="mt-5 text-sm text-ink/50">
                    No plays yet — they'll appear here as students take the challenge.
                  </p>
                ) : (
                  <ul className="mt-5 divide-y divide-ink/8">
                    {recent.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-ink/50">
                            {CATEGORY_LABELS[p.category]} · {formatDate(p.playedAt)}
                          </p>
                        </div>
                        <span
                          className={
                            p.isCorrect
                              ? "shrink-0 rounded-full bg-forest-soft px-2.5 py-1 text-xs font-semibold text-forest"
                              : "shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/50"
                          }
                        >
                          {p.isCorrect ? "+10 pts" : "0 pts"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
