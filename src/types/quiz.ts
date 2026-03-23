import type { Dispatch, SetStateAction } from 'react';

import type { TopicField, TopicItem } from '@/types/topics';

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

export type QuizAnswerDetail = {
  key: string;
  label: string;
  value: string;
};

export type QuizPlayableItem = {
  imageUrls: {
    desktop: string;
    mobile: string;
  };
  item: TopicItem;
  value: string;
};

export type UseQuizConfigResult = {
  answerDetailFieldKeys: string[];
  answerDetailFields: Extract<TopicField, { type: 'string' | 'number' | 'select' }>[];
  answerDetailsEnabled: boolean;
  autoAdvanceAfterAnswer: boolean;
  effectiveSelectedFieldKeys: string[];
  eligibleFields: QuizEligibleField[];
  handleToggleAnswerDetailField: (fieldKey: string, checked: boolean) => void;
  handleReset: () => void;
  handleStartQuiz: () => void;
  handleQuestionCountBlur: () => void;
  handleQuestionCountInputChange: (nextValue: string) => void;
  handleQuestionCountSliderChange: (nextValue: number) => void;
  handleToggleField: (fieldKey: string, checked: boolean) => void;
  maxQuestionCount: number;
  minQuestionCount: number;
  questionCount: number;
  selectedFields: QuizEligibleField[];
  setAnswerDetailsEnabled: Dispatch<SetStateAction<boolean>>;
  setAutoAdvanceAfterAnswer: Dispatch<SetStateAction<boolean>>;
  setShowCorrectAnswer: Dispatch<SetStateAction<boolean>>;
  showCorrectAnswer: boolean;
  startableFields: QuizEligibleField[];
};
