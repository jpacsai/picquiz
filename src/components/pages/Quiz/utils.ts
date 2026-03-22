import type { TopicItem } from '@service/items';

import type { Topic, TopicField } from '@/types/topics';

export type QuizEligibleField = {
  field: Extract<TopicField, { type: 'string' | 'number' | 'select' }>;
  eligibleItemCount: number;
  maxQuestionCount: number;
  promptsLabel: string;
  distinctValueCount: number;
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

export const getQuestionCountOptions = (maxQuestionCount: number): number[] => {
  if (maxQuestionCount <= 0) {
    return [];
  }

  const options: number[] = [];

  for (let count = QUESTION_COUNT_STEP; count <= maxQuestionCount; count += QUESTION_COUNT_STEP) {
    options.push(count);
  }

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
  const imageField = getImageField(topic);

  return topic.fields.filter(isQuizAnswerField).map((field) => {
    const values = items
      .map((item) => ({
        imageUrl: getItemImageUrl(item, imageField),
        value: getItemFieldValue(item, field.key),
      }))
      .filter(({ imageUrl, value }) => Boolean(imageUrl) && Boolean(value));

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
