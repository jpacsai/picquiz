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
import type {
  QuizItemFilter,
  QuizItemFilterRow,
  QuizValueField,
  UseQuizConfigResult,
} from '@/types/quiz';
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
  sanitizeQuizItemFilters,
} from '@/utils/quiz';

type UseQuizConfigParams = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const DEFAULT_ITEM_FILTER: QuizItemFilter = {
  fieldKey: '',
  value: '',
};

const getStoredItemFilters = (storageKey: string): QuizItemFilter[] => {
  if (typeof window === 'undefined') {
    return [DEFAULT_ITEM_FILTER];
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [DEFAULT_ITEM_FILTER];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [DEFAULT_ITEM_FILTER];
    }

    const parsedFilters = parsedValue.flatMap((item) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const fieldKey = 'fieldKey' in item && typeof item.fieldKey === 'string' ? item.fieldKey : '';
      const value = 'value' in item && typeof item.value === 'string' ? item.value : '';

      return [{ fieldKey, value }];
    });

    return parsedFilters.length ? parsedFilters : [DEFAULT_ITEM_FILTER];
  } catch {
    return [DEFAULT_ITEM_FILTER];
  }
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
  const itemFiltersStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.itemFilters(topic.id);
  const selectedFieldKeysStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.selectedFieldKeys(topic.id);
  const questionCountStorageKey: string = QUIZ_CONFIG_STORAGE_KEYS.questionCount(topic.id);
  const itemFilterFields = getQuizItemFilterFields(topic);
  const [itemFilters, setItemFilters] = useState<QuizItemFilter[]>(() =>
    getStoredItemFilters(itemFiltersStorageKey),
  );
  const normalizedItemFilters = sanitizeQuizItemFilters({
    filters: itemFilters,
    items,
    topic,
  });
  const { filteredItems, itemFilterRows } = normalizedItemFilters.reduce<{
    filteredItems: ReadonlyArray<TopicItem>;
    itemFilterRows: QuizItemFilterRow[];
  }>(
    (result, filter) => {
      const options = getQuizItemFilterOptions({
        fieldKey: filter.fieldKey,
        items: result.filteredItems,
        topic,
      });
      const nextFilter = {
        fieldKey: filter.fieldKey,
        value: options.some((option) => option.value === filter.value) ? filter.value : '',
      };
      const nextFilteredItems =
        nextFilter.fieldKey && nextFilter.value
          ? filterQuizItems({
              filters: [nextFilter],
              items: result.filteredItems,
              topic,
            })
          : result.filteredItems;

      return {
        filteredItems: nextFilteredItems,
        itemFilterRows: [
          ...result.itemFilterRows,
          {
            ...nextFilter,
            options,
          },
        ],
      };
    },
    {
      filteredItems: items,
      itemFilterRows: [],
    },
  );
  const effectiveItemFilters = itemFilterRows.map(({ fieldKey, value }) => ({
    fieldKey,
    value,
  }));
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
    window.localStorage.setItem(itemFiltersStorageKey, JSON.stringify(effectiveItemFilters));
  }, [effectiveItemFilters, itemFiltersStorageKey]);

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
    setItemFilters([DEFAULT_ITEM_FILTER]);
    setSelectedFieldKeys([]);
    setSelectedQuestionCount(defaultQuestionCount);
    setShowCorrectAnswer(DEFAULT_SHOW_CORRECT_ANSWER);
    setAutoAdvanceAfterAnswer(DEFAULT_AUTO_ADVANCE_AFTER_ANSWER);
  };

  const handleStartQuiz = () => {
    if (!selectedFields.length || !questionCount) {
      return;
    }

    const activeItemFilters = effectiveItemFilters.filter(
      (filter) => Boolean(filter.fieldKey) && Boolean(filter.value),
    );

    void navigate({
      to: '/$topicId/quiz',
      params: { topicId: topic.id },
      search: {
        answerDetailFieldKeys: answerDetailsEnabled ? effectiveAnswerDetailFieldKeys : [],
        answerFieldKeys: effectiveSelectedFieldKeys,
        autoAdvanceAfterAnswer,
        itemFilterFieldKeys: activeItemFilters.map((filter) => filter.fieldKey),
        itemFilterValues: activeItemFilters.map((filter) => filter.value),
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
    handleAddItemFilter: () => {
      setItemFilters((currentFilters) => [...currentFilters, DEFAULT_ITEM_FILTER]);
    },
    handleRemoveItemFilter: (index: number) => {
      setItemFilters((currentFilters) => {
        const nextFilters = currentFilters.filter((_, currentIndex) => currentIndex !== index);

        return nextFilters.length ? nextFilters : [DEFAULT_ITEM_FILTER];
      });
      setSelectedQuestionCount(0);
    },
    handleToggleAnswerDetailField,
    handleItemFilterFieldChange: (index: number, fieldKey: string) => {
      setItemFilters((currentFilters) =>
        currentFilters.map((filter, currentIndex) =>
          currentIndex === index ? { fieldKey, value: '' } : filter,
        ),
      );
      setSelectedQuestionCount(0);
    },
    handleItemFilterValueChange: (index: number, value: string) => {
      setItemFilters((currentFilters) =>
        currentFilters.map((filter, currentIndex) =>
          currentIndex === index ? { ...filter, value } : filter,
        ),
      );
      setSelectedQuestionCount(0);
    },
    handleReset,
    handleStartQuiz,
    handleQuestionCountBlur,
    handleQuestionCountInputChange,
    handleQuestionCountSliderChange: (value: number) => setSelectedQuestionCount(value),
    handleToggleField,
    itemFilterFields,
    itemFilterRows,
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
