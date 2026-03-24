import {
  DISTRACTOR_COUNT,
  QUESTION_COUNT_STEP,
} from '@/consts/quiz';
import type {
  QuizEligibleField,
  QuizPlayableItem,
  QuizQuestion,
} from '@/types/quiz';
import type { Topic, TopicField, TopicItem } from '@/types/topics';

export const getStoredBoolean = (storageKey: string, fallbackValue: boolean): boolean => {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (storedValue === 'true') {
    return true;
  }

  if (storedValue === 'false') {
    return false;
  }

  return fallbackValue;
};

export const getStoredNumber = (storageKey: string, fallbackValue: number): number => {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(storageKey);
  const parsedValue = storedValue ? Number(storedValue) : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

export const getStoredStringArray = (storageKey: string): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
};

const isQuizAnswerField = (
  field: TopicField,
): field is Extract<TopicField, { type: 'string' | 'number' | 'select' }> =>
  field.type !== 'imageUpload' && field.quiz?.enabled === true;

const getQuizPrompt = (field: TopicField): string =>
  field.quiz?.enabled ? field.quiz.prompt : '';

const derivationRegistry = {
  yearToCentury: (year: number) => {
    const centuryNum = Math.floor((year - 1) / 100) + 1;
    return `${centuryNum}-ik század`;
  },
} as const;

const getImageField = (topic: Topic): Extract<TopicField, { type: 'imageUpload' }> | null =>
  topic.fields.find(
    (field): field is Extract<TopicField, { type: 'imageUpload' }> => field.type === 'imageUpload',
  ) ?? null;

const getItemImageUrls = (
  item: TopicItem,
  imageField: Extract<TopicField, { type: 'imageUpload' }> | null,
): {
  desktop: string;
  mobile: string;
} => {
  if (!imageField) {
    return { desktop: '', mobile: '' };
  }

  const desktopUrl = item[imageField.targetFields.desktop];
  const mobileUrl = item[imageField.targetFields.mobile];

  return {
    desktop:
      typeof desktopUrl === 'string'
        ? desktopUrl
        : typeof mobileUrl === 'string'
          ? mobileUrl
          : '',
    mobile:
      typeof mobileUrl === 'string'
        ? mobileUrl
        : typeof desktopUrl === 'string'
          ? desktopUrl
          : '',
  };
};

const getItemFieldValue = (item: TopicItem, fieldKey: string): string => {
  const value = item[fieldKey];

  if (typeof value === 'number') {
    return String(value);
  }

  return typeof value === 'string' ? value.trim() : '';
};

const shuffleArray = <T>(values: readonly T[]): T[] => {
  return values.reduceRight<T[]>((shuffledValues, _, currentIndex) => {
    if (currentIndex === 0) {
      return shuffledValues;
    }

    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [shuffledValues[currentIndex], shuffledValues[randomIndex]] = [
      shuffledValues[randomIndex],
      shuffledValues[currentIndex],
    ];

    return shuffledValues;
  }, [...values]);
};

const resolveAbsoluteMaxNumericValue = (maxValue: number | 'todayYear'): number =>
  maxValue === 'todayYear' ? new Date().getFullYear() : maxValue;

const resolveMinNumericValue = ({
  correctNumber,
  minOffset,
  minValue,
}: {
  correctNumber: number;
  minOffset?: number;
  minValue?: number;
}): number | null => {
  const offsetMinimum = typeof minOffset === 'number' ? correctNumber - minOffset : null;

  if (typeof minValue === 'number' && typeof offsetMinimum === 'number') {
    return Math.max(minValue, offsetMinimum);
  }

  if (typeof minValue === 'number') {
    return minValue;
  }

  return offsetMinimum;
};

const resolveMaxNumericValue = ({
  correctNumber,
  maxOffset,
  maxValue,
}: {
  correctNumber: number;
  maxOffset?: number;
  maxValue: number | 'todayYear';
}): number => {
  const absoluteMaximum = resolveAbsoluteMaxNumericValue(maxValue);

  if (typeof maxOffset === 'number') {
    return Math.min(absoluteMaximum, correctNumber + maxOffset);
  }

  return absoluteMaximum;
};

const getDistinctTopicValues = ({
  answerFieldKey,
  items,
  topic,
}: {
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}) =>
  Array.from(
    new Set(getPlayableQuizItems({ answerFieldKey, items, topic }).map(({ value }) => value)),
  );

const getFieldOptions = (field: TopicField): string[] =>
  field.type === 'select' ? field.options : [];

const buildNumericRangeDistractors = ({
  correctValue,
  maxOffset,
  maxValue,
  minOffset,
  minValue,
}: {
  correctValue: string;
  maxOffset?: number;
  maxValue: number | 'todayYear';
  minOffset?: number;
  minValue?: number;
}): string[] => {
  const correctNumber = Number(correctValue);
  const resolvedMaxValue = resolveMaxNumericValue({ correctNumber, maxOffset, maxValue });
  const resolvedMinValue = resolveMinNumericValue({ correctNumber, minOffset, minValue });

  if (Number.isNaN(correctNumber) || resolvedMinValue === null || resolvedMinValue > resolvedMaxValue) {
    return [];
  }

  return Array.from(
    { length: resolvedMaxValue - resolvedMinValue + 1 },
    (_, index) => String(resolvedMinValue + index),
  ).filter((value) => value !== correctValue);
};

const buildDerivedRangeDistractors = ({
  correctValue,
  item,
  maxOffset,
  maxValue,
  minOffset,
  minValue,
  sourceField,
}: {
  correctValue: string;
  item: TopicItem;
  maxOffset?: number;
  maxValue: number | 'todayYear';
  minOffset?: number;
  minValue?: number;
  sourceField: string;
}) => {
  const sourceValue = item[sourceField];
  const sourceNumber = Number(sourceValue);
  const resolvedMaxValue = resolveMaxNumericValue({
    correctNumber: sourceNumber,
    maxOffset,
    maxValue,
  });
  const resolvedMinValue = resolveMinNumericValue({
    correctNumber: sourceNumber,
    minOffset,
    minValue,
  });

  if (
    (typeof sourceValue !== 'string' && typeof sourceValue !== 'number') ||
    Number.isNaN(sourceNumber) ||
    resolvedMinValue === null ||
    resolvedMinValue > resolvedMaxValue
  ) {
    return [];
  }

  return Array.from(
    new Set(
      Array.from(
        { length: resolvedMaxValue - resolvedMinValue + 1 },
        (_, index) => resolvedMinValue + index,
      )
        .map((value) => derivationRegistry.yearToCentury(value))
        .filter((value) => value !== correctValue),
    ),
  );
};

const getWrongAnswerCandidates = ({
  answerField,
  answerFieldKey,
  items,
  playableItem,
  topic,
}: {
  answerField: Extract<TopicField, { type: 'string' | 'number' | 'select' }>;
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  playableItem: QuizPlayableItem;
  topic: Topic;
}): string[] => {
  const distractor = answerField.quiz?.enabled ? answerField.quiz.distractor : undefined;

  if (!distractor) {
    return getDistinctTopicValues({ answerFieldKey, items, topic }).filter(
      (value) => value !== playableItem.value,
    );
  }

  if (distractor.type === 'fromOptions') {
    return getFieldOptions(answerField).filter((value) => value !== playableItem.value);
  }

  if (distractor.type === 'numericRange') {
    return buildNumericRangeDistractors({
      correctValue: playableItem.value,
      maxOffset: distractor.maxOffset,
      maxValue: distractor.maxValue,
      minOffset: distractor.minOffset,
      minValue: distractor.minValue,
    });
  }

  return buildDerivedRangeDistractors({
    correctValue: playableItem.value,
    item: playableItem.item,
    maxOffset: distractor.maxOffset,
    maxValue: distractor.maxValue,
    minOffset: distractor.minOffset,
    minValue: distractor.minValue,
    sourceField: distractor.sourceField,
  });
};

const canBuildQuestionForItem = ({
  answerField,
  answerFieldKey,
  items,
  playableItem,
  topic,
}: {
  answerField: Extract<TopicField, { type: 'string' | 'number' | 'select' }>;
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  playableItem: QuizPlayableItem;
  topic: Topic;
}) =>
  new Set(
    getWrongAnswerCandidates({
      answerField,
      answerFieldKey,
      items,
      playableItem,
      topic,
    }),
  ).size >= DISTRACTOR_COUNT;

export const getQuizAnswerField = (
  topic: Topic,
  answerFieldKey: string,
): Extract<TopicField, { type: 'string' | 'number' | 'select' }> | null =>
  topic.fields.find(
    (field): field is Extract<TopicField, { type: 'string' | 'number' | 'select' }> =>
      field.key === answerFieldKey && isQuizAnswerField(field),
  ) ?? null;

export const getPlayableQuizItems = ({
  answerFieldKey,
  items,
  topic,
}: {
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}): QuizPlayableItem[] => {
  const imageField = getImageField(topic);

  return items
    .map((item) => ({
      imageUrls: getItemImageUrls(item, imageField),
      item,
      value: getItemFieldValue(item, answerFieldKey),
    }))
    .filter(({ imageUrls, value }) => Boolean(imageUrls.desktop || imageUrls.mobile) && Boolean(value));
};

export const getQuestionCountOptions = (maxQuestionCount: number): number[] => {
  if (maxQuestionCount <= 0) {
    return [];
  }

  const stepCount = Math.floor(maxQuestionCount / QUESTION_COUNT_STEP);
  const options = Array.from({ length: stepCount }, (_, index) => (index + 1) * QUESTION_COUNT_STEP);

  if (!options.length || options.at(-1) !== maxQuestionCount) {
    options.push(maxQuestionCount);
  }

  return options;
};

export const getSelectedQuizFields = ({
  fieldKeys,
  items,
  topic,
}: {
  fieldKeys: readonly string[];
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}): QuizEligibleField[] => {
  const fieldKeySet = new Set(fieldKeys);

  return getEligibleQuizFields({ items, topic }).filter(({ field, maxQuestionCount }) => {
    return fieldKeySet.has(field.key) && maxQuestionCount > 0;
  });
};

export const getMaxQuestionCountForFields = ({
  fieldKeys,
  items,
  topic,
}: {
  fieldKeys: readonly string[];
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}): number =>
  getSelectedQuizFields({ fieldKeys, items, topic }).reduce(
    (total, field) => total + field.maxQuestionCount,
    0,
  );

export const getEligibleQuizFields = ({
  items,
  topic,
}: {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}): QuizEligibleField[] => {
  return topic.fields.filter(isQuizAnswerField).map((field) => {
    const playableItems = getPlayableQuizItems({
      answerFieldKey: field.key,
      items,
      topic,
    });
    const buildableItems = playableItems.filter((playableItem) =>
      canBuildQuestionForItem({
        answerField: field,
        answerFieldKey: field.key,
        items,
        playableItem,
        topic,
      }),
    );
    const distinctValueCount = new Set(playableItems.map(({ value }) => value)).size;
    const canStart = buildableItems.length > 0;

    return {
      field,
      eligibleItemCount: buildableItems.length,
      maxQuestionCount: canStart ? buildableItems.length : 0,
      promptsLabel: getQuizPrompt(field),
      distinctValueCount,
    };
  });
};

const buildQuizQuestionsForField = ({
  answerFieldKey,
  items,
  questionCount,
  topic,
}: {
  answerFieldKey: string;
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
}): QuizQuestion[] => {
  const answerField = getQuizAnswerField(topic, answerFieldKey);

  if (!answerField?.quiz?.enabled || questionCount <= 0) {
    return [];
  }

  const playableItems = getPlayableQuizItems({ answerFieldKey, items, topic }).filter(
    (playableItem) =>
      canBuildQuestionForItem({
        answerField,
        answerFieldKey,
        items,
        playableItem,
        topic,
      }),
  );

  return shuffleArray(playableItems)
    .slice(0, questionCount)
    .flatMap<QuizQuestion>((playableItem, questionIndex) => {
      const wrongAnswers = shuffleArray(
        Array.from(
          new Set(
            getWrongAnswerCandidates({
              answerField,
              answerFieldKey,
              items,
              playableItem,
              topic,
            }),
          ),
        ),
      ).slice(0, DISTRACTOR_COUNT);

      if (wrongAnswers.length < DISTRACTOR_COUNT) {
        return [];
      }

      const options = shuffleArray([
        {
          id: `${playableItem.item.id}-correct`,
          isCorrect: true,
          label: playableItem.value,
        },
        ...wrongAnswers.map((answer, wrongAnswerIndex) => ({
          id: `${playableItem.item.id}-wrong-${questionIndex}-${wrongAnswerIndex}`,
          isCorrect: false,
          label: answer,
        })),
      ]);

      return [
        {
          answerFieldKey,
          answerFieldLabel: answerField.label,
          correctAnswer: playableItem.value,
          imageUrls: playableItem.imageUrls,
          itemId: playableItem.item.id,
          options,
          prompt: getQuizPrompt(answerField),
        },
      ];
    });
};

export const buildQuizQuestions = ({
  answerFieldKeys,
  items,
  questionCount,
  topic,
}: {
  answerFieldKeys: readonly string[];
  items: ReadonlyArray<TopicItem>;
  questionCount: number;
  topic: Topic;
}): QuizQuestion[] => {
  if (!answerFieldKeys.length || questionCount <= 0) {
    return [];
  }

  const uniqueFieldKeys = Array.from(new Set(answerFieldKeys));
  const allQuestions = uniqueFieldKeys.flatMap((answerFieldKey) =>
    buildQuizQuestionsForField({
      answerFieldKey,
      items,
      questionCount,
      topic,
    }),
  );

  return shuffleArray(allQuestions).slice(0, questionCount);
};
