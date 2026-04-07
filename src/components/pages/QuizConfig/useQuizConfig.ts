import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
  DEFAULT_ANSWER_DETAILS_ENABLED,
  DEFAULT_ANSWER_DETAILS_EXPANDED,
  DEFAULT_AUTO_ADVANCE_AFTER_ANSWER,
  DEFAULT_QUESTION_COUNT,
  DEFAULT_SHOW_CORRECT_ANSWER,
  MIN_QUESTION_COUNT,
  QUIZ_CONFIG_STORAGE_KEYS,
} from '@/consts/quiz';
import type { QuizValueField, UseQuizConfigResult } from '@/types/quiz';
import type { Topic, TopicItem } from '@/types/topics';
import {
  filterQuizItems,
  getEligibleQuizFields,
  getMaxQuestionCountForFields,
  getQuizItemFilterFields,
  getQuizItemFilterOptions,
  getStoredBoolean,
  getStoredNumber,
  getStoredStringArray,
} from '@/utils/quiz';
import { getStoredString } from '@/utils/storage';

type UseQuizConfigParams = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

export const useQuizConfig = ({ items, topic }: UseQuizConfigParams): UseQuizConfigResult => {
  const navigate = useNavigate();
  const defaultAnswerDetailsEnabled: boolean = DEFAULT_ANSWER_DETAILS_ENABLED;
  const defaultAnswerDetailsExpanded: boolean = DEFAULT_ANSWER_DETAILS_EXPANDED;
  const answerDetailsExpandedStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.answerDetailsExpanded(
    topic.id,
  );
  const answerDetailsEnabledStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.answerDetailsEnabled(
    topic.id,
  );
  const answerDetailFieldKeysStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.answerDetailFieldKeys(
    topic.id,
  );
  const itemFilterFieldKeyStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.itemFilterFieldKey(topic.id);
  const itemFilterValueStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.itemFilterValue(topic.id);
  const selectedFieldKeysStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.selectedFieldKeys(topic.id);
  const questionCountStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.questionCount(topic.id);
  const itemFilterFields = getQuizItemFilterFields(topic);
  const [itemFilterFieldKey, setItemFilterFieldKey] = useState<string>(() =>
    getStoredString(itemFilterFieldKeyStorageKey),
  );
  const [itemFilterValue, setItemFilterValue] = useState<string>(() =>
    getStoredString(itemFilterValueStorageKey),
  );
  const effectiveItemFilterFieldKey = itemFilterFields.some((field) => field.key === itemFilterFieldKey)
    ? itemFilterFieldKey
    : '';
  const itemFilterOptions = getQuizItemFilterOptions({
    fieldKey: effectiveItemFilterFieldKey,
    items,
    topic,
  });
  const effectiveItemFilterValue = itemFilterOptions.some((option) => option.value === itemFilterValue)
    ? itemFilterValue
    : '';
  const filteredItems = filterQuizItems({
    fieldKey: effectiveItemFilterFieldKey,
    filterValue: effectiveItemFilterValue,
    items,
    topic,
  });
  const eligibleFields = getEligibleQuizFields({ items: filteredItems, topic });
  const startableFields = eligibleFields.filter((field) => field.maxQuestionCount > 0);
  const answerDetailFields: QuizValueField[] = startableFields.map(({ field }) => field);
  const [answerDetailFieldKeys, setAnswerDetailFieldKeys] = useState<string[]>(() =>
    getStoredStringArray(answerDetailFieldKeysStorageKey),
  );
  const [answerDetailsEnabled, setAnswerDetailsEnabled] = useState(() =>
    getStoredBoolean(answerDetailsEnabledStorageKey, defaultAnswerDetailsEnabled),
  );
  const [answerDetailsExpanded, setAnswerDetailsExpanded] = useState(() =>
    getStoredBoolean(answerDetailsExpandedStorageKey, defaultAnswerDetailsExpanded),
  );
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
    window.localStorage.setItem(answerDetailsEnabledStorageKey, String(answerDetailsEnabled));
  }, [answerDetailsEnabled, answerDetailsEnabledStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(answerDetailsExpandedStorageKey, String(answerDetailsExpanded));
  }, [answerDetailsExpanded, answerDetailsExpandedStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(itemFilterFieldKeyStorageKey, effectiveItemFilterFieldKey);
  }, [effectiveItemFilterFieldKey, itemFilterFieldKeyStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(itemFilterValueStorageKey, effectiveItemFilterValue);
  }, [effectiveItemFilterValue, itemFilterValueStorageKey]);

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
    items: filteredItems,
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
  const effectiveAnswerDetailFieldKeys = answerDetailFieldKeys.filter((fieldKey) =>
    answerDetailFields.some((field) => field.key === fieldKey),
  );

  useEffect(() => {
    window.localStorage.setItem(
      selectedFieldKeysStorageKey,
      JSON.stringify(effectiveSelectedFieldKeys),
    );
  }, [effectiveSelectedFieldKeys, selectedFieldKeysStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(
      answerDetailFieldKeysStorageKey,
      JSON.stringify(effectiveAnswerDetailFieldKeys),
    );
  }, [answerDetailFieldKeysStorageKey, effectiveAnswerDetailFieldKeys]);

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

  const handleToggleAnswerDetailField = (fieldKey: string, checked: boolean) => {
    const nextFieldKeys = checked
      ? [...effectiveAnswerDetailFieldKeys, fieldKey]
      : effectiveAnswerDetailFieldKeys.filter((currentFieldKey) => currentFieldKey !== fieldKey);

    setAnswerDetailFieldKeys(nextFieldKeys);
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
    setAnswerDetailsEnabled(defaultAnswerDetailsEnabled);
    setAnswerDetailsExpanded(defaultAnswerDetailsExpanded);
    setAnswerDetailFieldKeys([]);
    setItemFilterFieldKey('');
    setItemFilterValue('');
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
        answerDetailFieldKeys: answerDetailsEnabled ? effectiveAnswerDetailFieldKeys : [],
        answerFieldKeys: effectiveSelectedFieldKeys,
        autoAdvanceAfterAnswer,
        itemFilterFieldKey: effectiveItemFilterFieldKey,
        itemFilterValue: effectiveItemFilterValue,
        questionCount,
        showCorrectAnswer,
      },
    });
  };

  return {
    answerDetailFieldKeys: answerDetailsEnabled ? effectiveAnswerDetailFieldKeys : [],
    answerDetailFields,
    answerDetailsEnabled,
    answerDetailsExpanded,
    autoAdvanceAfterAnswer,
    effectiveSelectedFieldKeys,
    eligibleFields,
    filteredItemCount: filteredItems.length,
    handleToggleAnswerDetailField,
    handleItemFilterFieldChange: (fieldKey: string) => {
      setItemFilterFieldKey(fieldKey);
      setItemFilterValue('');
      setSelectedQuestionCount(0);
    },
    handleItemFilterValueChange: (value: string) => {
      setItemFilterValue(value);
      setSelectedQuestionCount(0);
    },
    handleReset,
    handleStartQuiz,
    handleQuestionCountBlur,
    handleQuestionCountInputChange,
    handleQuestionCountSliderChange: (value: number) => setSelectedQuestionCount(value),
    handleToggleField,
    itemFilterFieldKey: effectiveItemFilterFieldKey,
    itemFilterFields,
    itemFilterOptions,
    itemFilterValue: effectiveItemFilterValue,
    maxQuestionCount,
    minQuestionCount: MIN_QUESTION_COUNT,
    questionCount,
    selectedFields,
    setAnswerDetailsEnabled,
    setAnswerDetailsExpanded,
    setAutoAdvanceAfterAnswer,
    setShowCorrectAnswer,
    showCorrectAnswer,
    startableFields,
    totalItemCount: items.length,
  };
};
