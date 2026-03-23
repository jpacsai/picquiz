import type { TopicField } from "@/types/topics";

export type QuizEligibleField = {
  field: Extract<TopicField, { type: 'string' | 'number' | 'select' }>;
  eligibleItemCount: number;
  maxQuestionCount: number;
  promptsLabel: string;
  distinctValueCount: number;
};

export type QuizQuestionOption = {
  id: string;
  isCorrect: boolean;
  label: string;
};

export type QuizQuestion = {
  answerFieldKey: string;
  answerFieldLabel: string;
  correctAnswer: string;
  imageUrls: {
    desktop: string;
    mobile: string;
  };
  itemId: string;
  options: QuizQuestionOption[];
  prompt: string;
};