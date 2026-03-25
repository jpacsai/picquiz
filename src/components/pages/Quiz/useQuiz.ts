import { useEffect, useMemo, useState } from 'react';

import {
  AUTO_ADVANCE_DELAY_MS,
  AUTO_ADVANCE_INTERVAL_MS,
  INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS,
} from '@/consts/quiz';
import type { QuizAnswerDetail, QuizValueField } from '@/types/quiz';
import type { Topic, TopicItem } from '@/types/topics';
import { buildQuizQuestions, getSelectedQuizFields } from '@/utils/quiz';

type UseQuizParams = {
  answerDetailFieldKeys: string[];
  answerFieldKeys: string[];
  autoAdvanceAfterAnswer: boolean;
  isDesktop: boolean;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
};

export const useQuiz = ({
  answerDetailFieldKeys,
  answerFieldKeys,
  autoAdvanceAfterAnswer,
  isDesktop,
  items,
  questionCount,
  topic,
}: UseQuizParams) => {
  const [quizGeneration, setQuizGeneration] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [autoAdvanceCountdownSeconds, setAutoAdvanceCountdownSeconds] = useState(
    INITIAL_AUTO_ADVANCE_COUNTDOWN_SECONDS,
  );
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [score, setScore] = useState(0);

  const selectedFields = getSelectedQuizFields({ fieldKeys: answerFieldKeys, items, topic });
  const { questions } = useMemo(
    () => ({
      generation: quizGeneration,
      questions: buildQuizQuestions({
        answerFieldKeys,
        items,
        questionCount,
        topic,
      }),
    }),
    [answerFieldKeys, items, questionCount, quizGeneration, topic],
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
    setQuizGeneration((currentGeneration) => currentGeneration + 1);
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

  const currentAnswerDetails = (() => {
    if (!currentQuestion || !answerDetailFieldKeys.length) {
      return [] as QuizAnswerDetail[];
    }

    const currentItem = items.find((item) => item.id === currentQuestion.itemId);

    if (!currentItem) {
      return [] as QuizAnswerDetail[];
    }

    return topic.fields
      .filter(
        (field): field is QuizValueField =>
          (field.type === 'string' ||
            field.type === 'number' ||
            field.type === 'select' ||
            field.type === 'boolean') &&
          answerDetailFieldKeys.includes(field.key) &&
          field.key !== currentQuestion.answerFieldKey,
      )
      .flatMap((field) => {
        const value = currentItem[field.key];
        const displayValue =
          typeof value === 'boolean'
            ? value
              ? 'Igaz'
              : 'Hamis'
            : typeof value === 'number'
              ? String(value)
              : typeof value === 'string'
                ? value.trim()
                : '';

        return displayValue
          ? [
              {
                key: field.key,
                label: field.label,
                value: displayValue,
              },
            ]
          : [];
      });
  })();

  return {
    autoAdvanceCountdownSeconds,
    continueToNextQuestion,
    currentAnswerDetails,
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
