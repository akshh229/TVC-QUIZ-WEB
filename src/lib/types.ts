// src/lib/types.ts

export type Category =
  | "quiz"
  | "guess_leader"
  | "match_pair"
  | "leadership_scenario";

export const CATEGORIES: Category[] = [
  "quiz",
  "guess_leader",
  "match_pair",
  "leadership_scenario",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  quiz: "Quiz Challenge",
  guess_leader: "Guess the Leader",
  match_pair: "Match the Pair",
  leadership_scenario: "Leadership Scenario",
};

export interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  category: Category;
  questionText: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string;
  pairs?: MatchPair[];
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  department?: string;
  category: Category;
  questionId: string;
  isCorrect: boolean;
  score: number;
  playedAt: string;
}

export type QuestionInput = Omit<Question, "id" | "createdAt" | "updatedAt">;
export type ParticipantInput = Omit<Participant, "id" | "playedAt">;

export interface MediaItem {
  name: string;
  url: string;
  createdAt: string;
  size?: number;
}
