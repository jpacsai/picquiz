import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { QuizQuestion } from '@/types/quiz';
import type { Topic, TopicItem } from '@/types/topics';
import type {
  buildQuizQuestions as buildQuizQuestionsType,
  getSelectedQuizFields as getSelectedQuizFieldsType,
} from '@/utils/quiz';

import { useQuiz } from '../useQuiz';

const buildQuizQuestionsMock = vi.fn<typeof buildQuizQuestionsType>();
const getSelectedQuizFieldsMock = vi.fn<typeof getSelectedQuizFieldsType>(() => []);

vi.mock('@/utils/quiz', () => ({
  buildQuizQuestions: (...args: Parameters<typeof buildQuizQuestionsType>) =>
    buildQuizQuestionsMock(...args),
  getSelectedQuizFields: (...args: Parameters<typeof getSelectedQuizFieldsType>) =>
    getSelectedQuizFieldsMock(...args),
}));

const topic: Topic = {
  id: 'art',
  label: 'Art',
  slug: 'art',
  storage_prefix: 'art',
  fields: [
    {
      key: 'title',
      label: 'Cim',
      quiz: { enabled: true, prompt: 'Ki festette?' },
      type: 'string',
    },
    {
      key: 'image',
      label: 'Kep',
      fileNameFields: ['artist', 'title'],
      targetFields: { desktop: 'image_desktop', mobile: 'image_mobile' },
      type: 'imageUpload',
    },
  ],
};

const items: ReadonlyArray<TopicItem> = [
  {
    id: '1',
    image_desktop: '/image-1-desktop.jpg',
    image_mobile: '/image-1-mobile.jpg',
    title: 'One',
  },
];

const buildQuestion = (id: string, answer: string): QuizQuestion => ({
  answerFieldKey: 'title',
  answerFieldLabel: 'Cim',
  correctAnswer: answer,
  imageUrls: {
    desktop: `/${id}-desktop.jpg`,
    mobile: `/${id}-mobile.jpg`,
  },
  itemId: id,
  options: [
    { id: `${id}-correct`, isCorrect: true, label: answer },
    { id: `${id}-wrong-1`, isCorrect: false, label: 'Wrong 1' },
    { id: `${id}-wrong-2`, isCorrect: false, label: 'Wrong 2' },
    { id: `${id}-wrong-3`, isCorrect: false, label: 'Wrong 3' },
  ],
  prompt: 'Ki festette?',
});

describe('useQuiz', () => {
  it('rebuilds questions when restarting the quiz', () => {
    buildQuizQuestionsMock.mockReset();
    getSelectedQuizFieldsMock.mockClear();

    buildQuizQuestionsMock.mockImplementation(() => {
      const questionBuildCount = buildQuizQuestionsMock.mock.calls.length + 1;

      return questionBuildCount === 1
        ? [buildQuestion('first', 'Elso')]
        : [buildQuestion('second', 'Masodik')];
    });

    const { result } = renderHook(() =>
      useQuiz({
        answerDetailFieldKeys: [],
        answerFieldKeys: ['title'],
        autoAdvanceAfterAnswer: false,
        isDesktop: true,
        items,
        questionCount: 1,
        topic,
      }),
    );

    expect(result.current.questions[0]?.itemId).toBe('first');
    expect(buildQuizQuestionsMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.restartQuiz();
    });

    expect(result.current.questions[0]?.itemId).toBe('second');
    expect(buildQuizQuestionsMock).toHaveBeenCalledTimes(2);
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.selectedOptionId).toBe('');
  });
});
