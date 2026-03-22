import { useEffect, useMemo, useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import { buildQuizQuestions, getSelectedQuizFields } from './utils';

const AUTO_ADVANCE_DELAY_MS = 5000;

type UseQuizParams = {
  answerFieldKeys: string[];
  autoAdvanceAfterAnswer: boolean;
  isDesktop: boolean;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
};

export const useQuiz = ({
  answerFieldKeys,
  autoAdvanceAfterAnswer,
  isDesktop,
  items,
  questionCount,
  topic,
}: UseQuizParams) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [score, setScore] = useState(0);

  const selectedFields = getSelectedQuizFields({ fieldKeys: answerFieldKeys, items, topic });
  const questions = useMemo(
    () =>
      buildQuizQuestions({
        answerFieldKeys,
        items,
        questionCount,
        topic,
      }),
    [answerFieldKeys, items, questionCount, topic],
  );
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isQuizFinished = currentQuestionIndex >= questions.length;
  const selectedOption =
    currentQuestion?.options.find((option) => option.id === selectedOptionId) ?? null;
  const isAnswered = Boolean(selectedOption);
  const currentImageUrl = currentQuestion
    ? isDesktop
      ? currentQuestion.imageUrls.desktop
      : currentQuestion.imageUrls.mobile
    : '';

  useEffect(() => {
    if (!isAnswered || !autoAdvanceAfterAnswer) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
      setSelectedOptionId('');
    }, AUTO_ADVANCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoAdvanceAfterAnswer, isAnswered, selectedOptionId]);

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId('');
    setScore(0);
  };

  const continueToNextQuestion = () => {
    setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
    setSelectedOptionId('');
  };

  const selectOption = (optionId: string) => {
    setSelectedOptionId(optionId);

    const nextSelectedOption = currentQuestion?.options.find((option) => option.id === optionId);

    if (nextSelectedOption?.isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }
  };

  return {
    continueToNextQuestion,
    currentImageUrl,
    currentQuestion,
    currentQuestionIndex,
    isAnswered,
    isQuizFinished,
    questions,
    restartQuiz,
    score,
    selectOption,
    selectedFields,
    selectedOption,
    selectedOptionId,
  };
};
