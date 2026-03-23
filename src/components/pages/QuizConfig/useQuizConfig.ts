import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { UseQuizConfigResult } from '@/types/quiz';
import type { Topic, TopicItem } from '@/types/topics';
import { getEligibleQuizFields, getMaxQuestionCountForFields, getStoredBoolean, getStoredNumber, getStoredStringArray, QUIZ_CONFIG_STORAGE_KEYS } from '@/utils/quiz';

type UseQuizConfigParams = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const MIN_QUESTION_COUNT = 4;
const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_SHOW_CORRECT_ANSWER = true;
const DEFAULT_AUTO_ADVANCE_AFTER_ANSWER = false;

export const useQuizConfig = ({ items, topic }: UseQuizConfigParams): UseQuizConfigResult => {
  const navigate = useNavigate();
  const selectedFieldKeysStorageKey = QUIZ_CONFIG_STORAGE_KEYS.selectedFieldKeys(topic.id);
  const questionCountStorageKey = QUIZ_CONFIG_STORAGE_KEYS.questionCount(topic.id);
  const eligibleFields = getEligibleQuizFields({ items, topic });
  const startableFields = eligibleFields.filter((field) => field.maxQuestionCount > 0);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(() =>
    getStoredStringArray(selectedFieldKeysStorageKey),
  );
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(() =>
    getStoredNumber(questionCountStorageKey, 0),
  );
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(() =>
    getStoredBoolean(QUIZ_CONFIG_STORAGE_KEYS.showCorrectAnswer, DEFAULT_SHOW_CORRECT_ANSWER),
  );
  const [autoAdvanceAfterAnswer, setAutoAdvanceAfterAnswer] = useState(() =>
    getStoredBoolean(
      QUIZ_CONFIG_STORAGE_KEYS.autoAdvanceAfterAnswer,
      DEFAULT_AUTO_ADVANCE_AFTER_ANSWER,
    ),
  );

  useEffect(() => {
    window.localStorage.setItem(
      QUIZ_CONFIG_STORAGE_KEYS.showCorrectAnswer,
      String(showCorrectAnswer),
    );
  }, [showCorrectAnswer]);

  useEffect(() => {
    window.localStorage.setItem(
      QUIZ_CONFIG_STORAGE_KEYS.autoAdvanceAfterAnswer,
      String(autoAdvanceAfterAnswer),
    );
  }, [autoAdvanceAfterAnswer]);

  const effectiveSelectedFieldKeys = selectedFieldKeys.length
    ? selectedFieldKeys.filter((fieldKey) =>
        startableFields.some(({ field }) => field.key === fieldKey),
      )
    : startableFields.slice(0, 1).map(({ field }) => field.key);
  const selectedFields = startableFields.filter(({ field }) =>
    effectiveSelectedFieldKeys.includes(field.key),
  );
  const maxQuestionCount = getMaxQuestionCountForFields({
    fieldKeys: effectiveSelectedFieldKeys,
    items,
    topic,
  });
  const defaultQuestionCount =
    maxQuestionCount >= DEFAULT_QUESTION_COUNT
      ? DEFAULT_QUESTION_COUNT
      : maxQuestionCount >= MIN_QUESTION_COUNT
        ? maxQuestionCount
        : 0;
  const questionCount =
    selectedQuestionCount >= MIN_QUESTION_COUNT && selectedQuestionCount <= maxQuestionCount
      ? selectedQuestionCount
      : defaultQuestionCount;

  useEffect(() => {
    window.localStorage.setItem(
      selectedFieldKeysStorageKey,
      JSON.stringify(effectiveSelectedFieldKeys),
    );
  }, [effectiveSelectedFieldKeys, selectedFieldKeysStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(questionCountStorageKey, String(questionCount));
  }, [questionCount, questionCountStorageKey]);

  const handleToggleField = (fieldKey: string, checked: boolean) => {
    const nextFieldKeys = checked
      ? [...effectiveSelectedFieldKeys, fieldKey]
      : effectiveSelectedFieldKeys.filter((currentFieldKey) => currentFieldKey !== fieldKey);

    setSelectedFieldKeys(nextFieldKeys);
    setSelectedQuestionCount(0);
  };

  const handleQuestionCountSliderChange = (_event: Event, nextValue: number | number[]) => {
    setSelectedQuestionCount(Array.isArray(nextValue) ? (nextValue[0] ?? 0) : nextValue);
  };

  const handleQuestionCountInputChange = (nextValue: string) => {
    setSelectedQuestionCount(nextValue === '' ? 0 : Number(nextValue));
  };

  const handleQuestionCountBlur = () => {
    if (maxQuestionCount <= 0) {
      setSelectedQuestionCount(0);
      return;
    }

    if (selectedQuestionCount < MIN_QUESTION_COUNT) {
      setSelectedQuestionCount(Math.min(MIN_QUESTION_COUNT, maxQuestionCount));
      return;
    }

    if (selectedQuestionCount > maxQuestionCount) {
      setSelectedQuestionCount(maxQuestionCount);
    }
  };

  const handleReset = () => {
    setSelectedFieldKeys([]);
    setSelectedQuestionCount(defaultQuestionCount);
    setShowCorrectAnswer(DEFAULT_SHOW_CORRECT_ANSWER);
    setAutoAdvanceAfterAnswer(DEFAULT_AUTO_ADVANCE_AFTER_ANSWER);
  };

  const handleStartQuiz = () => {
    if (!selectedFields.length || !questionCount) {
      return;
    }

    void navigate({
      to: '/$topicId/quiz',
      params: { topicId: topic.id },
      search: {
        answerFieldKeys: effectiveSelectedFieldKeys,
        autoAdvanceAfterAnswer,
        questionCount,
        showCorrectAnswer,
      },
    });
  };

  return {
    autoAdvanceAfterAnswer,
    effectiveSelectedFieldKeys,
    eligibleFields,
    handleReset,
    handleStartQuiz,
    handleQuestionCountBlur,
    handleQuestionCountInputChange,
    handleQuestionCountSliderChange,
    handleToggleField,
    maxQuestionCount,
    minQuestionCount: MIN_QUESTION_COUNT,
    questionCount,
    selectedFields,
    setAutoAdvanceAfterAnswer,
    setShowCorrectAnswer,
    showCorrectAnswer,
    startableFields,
  };
};
