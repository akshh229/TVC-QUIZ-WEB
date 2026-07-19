// src/store/gameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Category, Question } from "@/lib/types";

export type GamePhase =
  | "welcome"
  | "details"
  | "spin"
  | "challenge"
  | "result"
  | "finished";

interface GameState {
  participantName: string;
  department: string;
  selectedCategory: Category | null;
  currentQuestion: Question | null;
  isCorrect: boolean | null;
  score: number;
  phase: GamePhase;
  setParticipant: (name: string, department: string) => void;
  setCategory: (category: Category) => void;
  setQuestion: (question: Question) => void;
  setResult: (isCorrect: boolean) => void;
  setPhase: (phase: GamePhase) => void;
  resetSession: () => void;
}

const initialState = {
  participantName: "",
  department: "",
  selectedCategory: null,
  currentQuestion: null,
  isCorrect: null,
  score: 0,
  phase: "welcome" as GamePhase,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      setParticipant: (name, department) =>
        set({ participantName: name.trim(), department: department.trim(), phase: "spin" }),
      setCategory: (category) => set({ selectedCategory: category, phase: "challenge" }),
      setQuestion: (question) => set({ currentQuestion: question }),
      setResult: (isCorrect) =>
        set({ isCorrect, score: isCorrect ? 10 : 0, phase: "result" }),
      setPhase: (phase) => set({ phase }),
      resetSession: () => set({ ...initialState }),
    }),
    {
      name: "spin-to-lead-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
