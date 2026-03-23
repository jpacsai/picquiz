import { useEffect, useMemo, useState } from 'react';

import {
  AUTO_ADVANCE_DELAY_MS,
  AUTO_ADVANCE_INTERVAL_MS,
  INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS,
} from '@/consts/quiz';
import type { Topic, TopicItem } from '@/types/topics';
import { buildQuizQuestions, getSelectedQuizFields } from '@/utils/quiz';

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
  const [autoAdvanceCountdownSeconds, setAutoAdvanceCountdownSeconds] = useState(
    INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS,
  );
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

    const intervalId = window.setInterval(() => {
      setAutoAdvanceCountdownSeconds((currentSeconds) => Math.max(currentSeconds - 1, 1));
    }, AUTO_ADVANCE_INTERVAL_MS);

    const timeoutId = window.setTimeout(() => {
      setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
      setSelectedOptionId('');
    }, AUTO_ADVANCE_DELAY_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [autoAdvanceAfterAnswer, isAnswered, selectedOptionId]);

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAutoAdvanceCountdownSeconds(INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS);
    setSelectedOptionId('');
    setScore(0);
  };

  const continueToNextQuestion = () => {
    setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
    setAutoAdvanceCountdownSeconds(INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS);
    setSelectedOptionId('');
  };

  const selectOption = (optionId: string) => {
    setAutoAdvanceCountdownSeconds(INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS);
    setSelectedOptionId(optionId);

    const nextSelectedOption = currentQuestion?.options.find((option) => option.id === optionId);

    if (nextSelectedOption?.isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }
  };

  return {
    autoAdvanceCountdownSeconds,
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
