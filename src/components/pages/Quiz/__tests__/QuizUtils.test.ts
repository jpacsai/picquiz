import { describe, expect, it } from 'vitest';

import type { Topic, TopicItem } from '@/types/topics';
import { getEligibleQuizFields } from '@/utils/quiz';

const topicWithMinOffset: Topic = {
  fields: [
    {
      key: 'year',
      label: 'Ev',
      quiz: {
        enabled: true,
        prompt: 'Melyik evben keszult?',
        distractor: {
          type: 'numericRange',
          minOffset: 200,
          maxValue: 'todayYear',
        },
      },
      type: 'number',
    },
    {
      buttonLabel: 'Upload image',
      fileNameFields: ['artist', 'title'],
      key: 'image_upload',
      label: 'Upload image',
      targetFields: {
        desktop: 'image_url_desktop',
        mobile: 'image_url_mobile',
      },
      type: 'imageUpload',
    },
  ],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

const topicWithBoundedNumericOffsets: Topic = {
  fields: [
    {
      key: 'year',
      label: 'Ev',
      quiz: {
        enabled: true,
        prompt: 'Melyik evben keszult?',
        distractor: {
          type: 'numericRange',
          minOffset: 1,
          maxOffset: 3,
          maxValue: 'todayYear',
        },
      },
      type: 'number',
    },
    {
      buttonLabel: 'Upload image',
      fileNameFields: ['artist', 'title'],
      key: 'image_upload',
      label: 'Upload image',
      targetFields: {
        desktop: 'image_url_desktop',
        mobile: 'image_url_mobile',
      },
      type: 'imageUpload',
    },
  ],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

const topicWithBoundedDerivedOffsets: Topic = {
  fields: [
    {
      key: 'century',
      label: 'Szazad',
      quiz: {
        enabled: true,
        prompt: 'Melyik szazadban keszult?',
        distractor: {
          deriveWith: 'yearToCentury',
          type: 'derivedRange',
          sourceField: 'year',
          minOffset: 250,
          maxOffset: 50,
          maxValue: 'todayYear',
        },
      },
      type: 'string',
    },
    {
      key: 'year',
      label: 'Ev',
      type: 'number',
    },
    {
      buttonLabel: 'Upload image',
      fileNameFields: ['artist', 'title'],
      key: 'image_upload',
      label: 'Upload image',
      targetFields: {
        desktop: 'image_url_desktop',
        mobile: 'image_url_mobile',
      },
      type: 'imageUpload',
    },
  ],
  id: 'art',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
};

const items: ReadonlyArray<TopicItem> = [
  {
    id: 'item-1',
    image_url_desktop: 'https://example.com/1-desktop.jpg',
    image_url_mobile: 'https://example.com/1-mobile.jpg',
    year: 1503,
  },
  {
    id: 'item-2',
    image_url_desktop: 'https://example.com/2-desktop.jpg',
    image_url_mobile: 'https://example.com/2-mobile.jpg',
    year: 1498,
  },
  {
    id: 'item-3',
    image_url_desktop: 'https://example.com/3-desktop.jpg',
    image_url_mobile: 'https://example.com/3-mobile.jpg',
    year: 1665,
  },
];

const boundedNumericItems: ReadonlyArray<TopicItem> = [
  {
    id: 'item-1',
    image_url_desktop: 'https://example.com/1-desktop.jpg',
    image_url_mobile: 'https://example.com/1-mobile.jpg',
    year: 1503,
  },
];

const boundedDerivedItems: ReadonlyArray<TopicItem> = [
  {
    century: '16-ik szazad',
    id: 'item-1',
    image_url_desktop: 'https://example.com/1-desktop.jpg',
    image_url_mobile: 'https://example.com/1-mobile.jpg',
    year: 1503,
  },
];

describe('quiz utils', () => {
  it('treats numericRange minOffset as a valid distractor config', () => {
    const eligibleFields = getEligibleQuizFields({ items, topic: topicWithMinOffset });

    expect(eligibleFields).toHaveLength(1);
    expect(eligibleFields[0]?.field.key).toBe('year');
    expect(eligibleFields[0]?.maxQuestionCount).toBeGreaterThan(0);
  });

  it('treats numericRange maxOffset as relative to the correct field value', () => {
    const eligibleFields = getEligibleQuizFields({
      items: boundedNumericItems,
      topic: topicWithBoundedNumericOffsets,
    });

    expect(eligibleFields).toHaveLength(1);
    expect(eligibleFields[0]?.field.key).toBe('year');
    expect(eligibleFields[0]?.maxQuestionCount).toBeGreaterThan(0);
  });

  it('treats derivedRange offsets as relative to the source field value', () => {
    const eligibleFields = getEligibleQuizFields({
      items: boundedDerivedItems,
      topic: topicWithBoundedDerivedOffsets,
    });

    expect(eligibleFields).toHaveLength(1);
    expect(eligibleFields[0]?.field.key).toBe('century');
    expect(eligibleFields[0]?.maxQuestionCount).toBeGreaterThan(0);
  });
});
