import { describe, expect, it } from 'vitest';

import {
  filterTopicItems,
  getDefaultSearchFieldKey,
  getSearchableTopicFields,
  sortTopicItemsByNewestCreated,
} from '@/components/pages/Admin/TopicCollection/utils';
import type { Topic } from '@/types/topics';

describe('TopicCollection utils', () => {
  it('sorts items by created_at descending', () => {
    expect(
      sortTopicItemsByNewestCreated([
        { id: 'oldest', created_at: { seconds: 100 } },
        { id: 'newest', created_at: { seconds: 300 } },
        { id: 'middle', created_at: { seconds: 200 } },
      ]).map((item) => item.id),
    ).toEqual(['newest', 'middle', 'oldest']);
  });

  it('supports firestore timestamp objects with toMillis', () => {
    expect(
      sortTopicItemsByNewestCreated([
        { id: 'older', created_at: { toMillis: () => 1_000 } },
        { id: 'newer', created_at: { toMillis: () => 2_000 } },
      ]).map((item) => item.id),
    ).toEqual(['newer', 'older']);
  });

  it('keeps items without created_at at the end', () => {
    expect(
      sortTopicItemsByNewestCreated([
        { id: 'missing' },
        { id: 'dated', created_at: { seconds: 100 } },
      ]).map((item) => item.id),
    ).toEqual(['dated', 'missing']);
  });

  it('returns searchable topic fields only for visible supported fields', () => {
    const topic: Topic = {
      fields: [
        {
          key: 'artist',
          label: 'Artist',
          quiz: { enabled: true, prompt: 'Ki az alkoto?' },
          type: 'string',
        },
        { key: 'year', label: 'Year', type: 'number' },
        {
          key: 'style',
          label: 'Style',
          options: ['barokk'],
          quiz: { enabled: true, prompt: 'Milyen stilus?' },
          type: 'select',
        },
        {
          hideInEdit: true,
          key: 'internal_note',
          label: 'Internal note',
          quiz: { enabled: true, prompt: 'Belso mező' },
          type: 'string',
        },
        {
          buttonLabel: 'Kép feltöltése',
          fileNameFields: ['artist', 'title'],
          key: 'image',
          label: 'Kép',
          targetFields: { desktop: 'desktop', mobile: 'mobile' },
          type: 'imageUpload',
        },
      ],
      id: 'art',
      label: 'Műalkotások',
      slug: 'art',
      storage_prefix: 'art',
    };

    expect(getSearchableTopicFields(topic.fields).map((field) => field.key)).toEqual([
      'artist',
      'year',
      'style',
    ]);
    expect(getDefaultSearchFieldKey(topic)).toBe('artist');
  });

  it('filters items by the selected field in a case insensitive way', () => {
    expect(
      filterTopicItems({
        fieldKey: 'artist',
        items: [
          { artist: 'Leonardo da Vinci', id: '1', year: 1503 },
          { artist: 'Vincent van Gogh', id: '2', year: 1889 },
          { artist: 'Claude Monet', id: '3', year: 1872 },
        ],
        query: 'vin',
      }).map((item) => item.id),
    ).toEqual(['1', '2']);
  });

  it('returns all items when the query or field is missing', () => {
    const items = [
      { artist: 'Leonardo da Vinci', id: '1' },
      { artist: 'Vincent van Gogh', id: '2' },
    ];

    expect(filterTopicItems({ fieldKey: 'artist', items, query: '   ' })).toEqual(items);
    expect(filterTopicItems({ fieldKey: '', items, query: 'vin' })).toEqual(items);
  });
});
