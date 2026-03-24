import { describe, expect, it } from 'vitest';

import { normalizeTopicDocument, serializeTopicDocument } from './topicDocuments';

describe('normalizeTopicDocument', () => {
  it('normalizes comma-separated select options into a sorted array', () => {
    expect(
      normalizeTopicDocument('art-topic', {
        fields: [
          {
            key: 'era',
            label: 'Korszak',
            options: ' Reneszansz, Barokk ',
            type: 'select',
          },
        ],
        label: 'Muveszet',
        slug: 'art',
        storage_prefix: 'art',
      }),
    ).toEqual({
      fields: [
        {
          key: 'era',
          label: 'Korszak',
          options: ['Barokk', 'Reneszansz'],
          type: 'select',
        },
      ],
      id: 'art-topic',
      label: 'Muveszet',
      slug: 'art',
      storage_prefix: 'art',
    });
  });

  it('normalizes array select options into a sorted array', () => {
    expect(
      normalizeTopicDocument('art-topic', {
        fields: [
          {
            key: 'era',
            label: 'Korszak',
            options: ['Reneszansz', 'Barokk'],
            type: 'select',
          },
        ],
        label: 'Muveszet',
        slug: 'art',
        storage_prefix: 'art',
      }).fields[0],
    ).toEqual({
      key: 'era',
      label: 'Korszak',
      options: ['Barokk', 'Reneszansz'],
      type: 'select',
    });
  });
});

describe('serializeTopicDocument', () => {
  it('sorts select options before persisting the topic', () => {
    expect(
      serializeTopicDocument({
        fields: [
          {
            key: 'era',
            label: 'Korszak',
            options: ['Reneszansz', 'Barokk'],
            type: 'select',
          },
        ],
        label: 'Muveszet',
        slug: 'art',
        storage_prefix: 'art',
      }),
    ).toEqual({
      fields: [
        {
          key: 'era',
          label: 'Korszak',
          options: ['Barokk', 'Reneszansz'],
          type: 'select',
        },
      ],
      label: 'Muveszet',
      slug: 'art',
      storage_prefix: 'art',
    });
  });
});
