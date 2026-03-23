import { describe, expect, it } from 'vitest';

import { sortTopicItemsByNewestCreated } from '@/components/pages/Admin/TopicCollection/utils';


describe('sortTopicItemsByNewestCreated', () => {
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
});
