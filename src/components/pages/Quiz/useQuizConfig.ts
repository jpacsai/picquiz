import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import {
  getEligibleQuizFields,
  getMaxQuestionCountForFields,
  getQuestionCountOptions,
  getStoredBoolean,
  getStoredNumber,
  getStoredStringArray,
  QUIZ_CONFIG_STORAGE_KEYS,
} from './utils';

type UseQuizConfigParams = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

export const useQuizConfig = ({ items, topic }: UseQuizConfigParams) => {
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
    getStoredBoolean(QUIZ_CONFIG_STORAGE_KEYS.showCorrectAnswer, true),
  );
  const [autoAdvanceAfterAnswer, setAutoAdvanceAfterAnswer] = useState(() =>
    getStoredBoolean(QUIZ_CONFIG_STORAGE_KEYS.autoAdvanceAfterAnswer, false),
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
  const questionCountOptions = getQuestionCountOptions(maxQuestionCount);
  const questionCount = questionCountOptions.includes(selectedQuestionCount)
    ? selectedQuestionCount
    : (questionCountOptions[0] ?? 0);

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
    handleStartQuiz,
    handleToggleField,
    questionCount,
    questionCountOptions,
    selectedFields,
    setAutoAdvanceAfterAnswer,
    setSelectedQuestionCount,
    setShowCorrectAnswer,
    showCorrectAnswer,
    startableFields,
  };
};
