import type { TopicItem } from '@service/items';

import type { Topic, TopicField } from '@/types/topics';

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
  imageUrl: string;
  itemId: string;
  options: QuizQuestionOption[];
  prompt: string;
};

const QUESTION_COUNT_STEP = 5;
const MIN_OPTION_COUNT = 4;

const isQuizAnswerField = (
  field: TopicField,
): field is Extract<TopicField, { type: 'string' | 'number' | 'select' }> =>
  field.type !== 'imageUpload' && field.quiz?.enabled === true;

const getQuizPrompt = (field: TopicField): string =>
  field.quiz?.enabled ? field.quiz.prompt : '';

const getImageField = (topic: Topic): Extract<TopicField, { type: 'imageUpload' }> | null =>
  topic.fields.find(
    (field): field is Extract<TopicField, { type: 'imageUpload' }> => field.type === 'imageUpload',
  ) ?? null;

const getItemImageUrl = (
  item: TopicItem,
  imageField: Extract<TopicField, { type: 'imageUpload' }> | null,
): string => {
  if (!imageField) {
    return '';
  }

  const desktopUrl = item[imageField.targetFields.desktop];
  const mobileUrl = item[imageField.targetFields.mobile];

  return typeof desktopUrl === 'string'
    ? desktopUrl
    : typeof mobileUrl === 'string'
      ? mobileUrl
      : '';
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

type QuizPlayableItem = {
  imageUrl: string;
  item: TopicItem;
  value: string;
};

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
      imageUrl: getItemImageUrl(item, imageField),
      item,
      value: getItemFieldValue(item, answerFieldKey),
    }))
    .filter(({ imageUrl, value }) => Boolean(imageUrl) && Boolean(value));
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

export const getEligibleQuizFields = ({
  items,
  topic,
}: {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
}): QuizEligibleField[] => {
  return topic.fields.filter(isQuizAnswerField).map((field) => {
    const values = getPlayableQuizItems({
      answerFieldKey: field.key,
      items,
      topic,
    });

    const distinctValueCount = new Set(values.map(({ value }) => value)).size;
    const canStart = distinctValueCount >= MIN_OPTION_COUNT;

    return {
      field,
      eligibleItemCount: values.length,
      maxQuestionCount: canStart ? values.length : 0,
      promptsLabel: getQuizPrompt(field),
      distinctValueCount,
    };
  });
};

export const buildQuizQuestions = ({
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

  const playableItems = getPlayableQuizItems({ answerFieldKey, items, topic });
  const distinctValues = Array.from(new Set(playableItems.map(({ value }) => value)));

  if (distinctValues.length < MIN_OPTION_COUNT) {
    return [];
  }

  return shuffleArray(playableItems)
    .slice(0, questionCount)
    .flatMap<QuizQuestion>((playableItem, questionIndex) => {
      const wrongAnswers = shuffleArray(
        distinctValues.filter((value) => value !== playableItem.value),
      ).slice(0, MIN_OPTION_COUNT - 1);

      if (wrongAnswers.length < MIN_OPTION_COUNT - 1) {
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
          imageUrl: playableItem.imageUrl,
          itemId: playableItem.item.id,
          options,
          prompt: getQuizPrompt(answerField),
        },
      ];
    });
};
