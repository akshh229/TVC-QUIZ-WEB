// src/lib/api.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getSupabase, isMockMode, LEADER_IMAGES_BUCKET } from "./supabase";
import { SEED_QUESTIONS } from "./mockData";
import type {
  Category,
  MediaItem,
  Participant,
  ParticipantInput,
  Question,
  QuestionInput,
} from "./types";
import { getSeenQuestionIds, markQuestionSeen, pickRandom } from "./utils";

// ─── Mock in-memory store (session-lifetime, mutable for admin CRUD) ──

const mockDb = {
  questions: SEED_QUESTIONS.map((q) => ({ ...q })),
  participants: [] as Participant[],
  media: [] as MediaItem[],
};

function mockId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Row mapping (Supabase snake_case ⇄ app camelCase) ────────────────

interface QuestionRow {
  id: string;
  category: Category;
  question_text: string;
  image_url: string | null;
  options: string[] | null;
  correct_answer: string | null;
  pairs: { left: string; right: string }[] | null;
  explanation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ParticipantRow {
  id: string;
  name: string;
  department: string | null;
  category: Category;
  question_id: string;
  is_correct: boolean;
  score: number;
  played_at: string;
}

function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    category: row.category,
    questionText: row.question_text,
    imageUrl: row.image_url ?? undefined,
    options: row.options ?? undefined,
    correctAnswer: row.correct_answer ?? undefined,
    pairs: row.pairs ?? undefined,
    explanation: row.explanation ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function questionToRow(input: QuestionInput): Omit<QuestionRow, "id" | "created_at" | "updated_at"> {
  return {
    category: input.category,
    question_text: input.questionText,
    image_url: input.imageUrl ?? null,
    options: input.options ?? null,
    correct_answer: input.correctAnswer ?? null,
    pairs: input.pairs ?? null,
    explanation: input.explanation ?? null,
    is_active: input.isActive,
  };
}

function rowToParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    department: row.department ?? undefined,
    category: row.category,
    questionId: row.question_id,
    isCorrect: row.is_correct,
    score: row.score,
    playedAt: row.played_at,
  };
}

// ─── Participant-side hooks ───────────────────────────────────────────

/**
 * Fetch one random active question for a category, avoiding
 * recently-seen questions where possible.
 */
export function useRandomQuestion(category: Category | null) {
  return useQuery({
    queryKey: ["random-question", category],
    enabled: !!category,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    queryFn: async (): Promise<Question> => {
      if (!category) throw new Error("No category selected");

      let pool: Question[];
      if (isMockMode) {
        pool = mockDb.questions.filter((q) => q.category === category && q.isActive);
      } else {
        const supabase = getSupabase()!;
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("category", category)
          .eq("is_active", true);
        if (error) throw new Error(error.message);
        pool = (data as QuestionRow[]).map(rowToQuestion);
      }

      if (pool.length === 0) {
        throw new Error("No active questions available for this category.");
      }

      const seen = new Set(getSeenQuestionIds());
      const unseen = pool.filter((q) => !seen.has(q.id));
      const question = pickRandom(unseen.length > 0 ? unseen : pool)!;
      markQuestionSeen(question.id);
      return question;
    },
  });
}

/** Record a participant's play (answer submission). */
export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ParticipantInput): Promise<Participant> => {
      if (isMockMode) {
        const participant: Participant = {
          ...input,
          id: mockId("p"),
          playedAt: new Date().toISOString(),
        };
        mockDb.participants.push(participant);
        return participant;
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from("participants")
        .insert({
          name: input.name,
          department: input.department ?? null,
          category: input.category,
          question_id: input.questionId,
          is_correct: input.isCorrect,
          score: input.score,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return rowToParticipant(data as ParticipantRow);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────

export function useQuestions() {
  return useQuery({
    queryKey: ["questions"],
    queryFn: async (): Promise<Question[]> => {
      if (isMockMode) {
        return [...mockDb.questions].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        );
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data as QuestionRow[]).map(rowToQuestion);
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuestionInput): Promise<Question> => {
      if (isMockMode) {
        const now = new Date().toISOString();
        const question: Question = { ...input, id: mockId("q"), createdAt: now, updatedAt: now };
        mockDb.questions.unshift(question);
        return question;
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from("questions")
        .insert(questionToRow(input))
        .select()
        .single();
      if (error) throw new Error(error.message);
      return rowToQuestion(data as QuestionRow);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: QuestionInput }): Promise<Question> => {
      if (isMockMode) {
        const index = mockDb.questions.findIndex((q) => q.id === id);
        if (index === -1) throw new Error("Question not found");
        const updated: Question = {
          ...mockDb.questions[index],
          ...input,
          updatedAt: new Date().toISOString(),
        };
        mockDb.questions[index] = updated;
        return updated;
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from("questions")
        .update(questionToRow(input))
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return rowToQuestion(data as QuestionRow);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (isMockMode) {
        mockDb.questions = mockDb.questions.filter((q) => q.id !== id);
        return;
      }
      const supabase = getSupabase()!;
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useParticipants() {
  return useQuery({
    queryKey: ["participants"],
    queryFn: async (): Promise<Participant[]> => {
      if (isMockMode) {
        return [...mockDb.participants].sort((a, b) =>
          b.playedAt.localeCompare(a.playedAt)
        );
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("played_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data as ParticipantRow[]).map(rowToParticipant);
    },
  });
}

// ─── Media hooks ──────────────────────────────────────────────────────

export function useMediaList() {
  return useQuery({
    queryKey: ["media"],
    queryFn: async (): Promise<MediaItem[]> => {
      if (isMockMode) {
        return [...mockDb.media].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      const supabase = getSupabase()!;
      const { data, error } = await supabase.storage
        .from(LEADER_IMAGES_BUCKET)
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new Error(error.message);
      return (data ?? [])
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from(LEADER_IMAGES_BUCKET).getPublicUrl(f.name).data.publicUrl,
          createdAt: f.created_at ?? new Date().toISOString(),
          size: (f.metadata as { size?: number } | null)?.size,
        }));
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<MediaItem> => {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      if (isMockMode) {
        const url = URL.createObjectURL(file);
        const item: MediaItem = {
          name: safeName,
          url,
          createdAt: new Date().toISOString(),
          size: file.size,
        };
        mockDb.media.unshift(item);
        return item;
      }
      const supabase = getSupabase()!;
      const { error } = await supabase.storage
        .from(LEADER_IMAGES_BUCKET)
        .upload(safeName, file, { upsert: false });
      if (error) throw new Error(error.message);
      const url = supabase.storage.from(LEADER_IMAGES_BUCKET).getPublicUrl(safeName).data.publicUrl;
      return { name: safeName, url, createdAt: new Date().toISOString(), size: file.size };
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["media"] }),
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<void> => {
      if (isMockMode) {
        mockDb.media = mockDb.media.filter((m) => m.name !== name);
        return;
      }
      const supabase = getSupabase()!;
      const { error } = await supabase.storage.from(LEADER_IMAGES_BUCKET).remove([name]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["media"] }),
  });
}
