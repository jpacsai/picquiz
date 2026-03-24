import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Topic } from '@/types/topics';

import { createTopic, updateTopic } from './topics';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  db: { name: 'mock-db' },
}));

const topicValues: Pick<Topic, 'label' | 'slug' | 'storage_prefix' | 'fields'> = {
  fields: [
    {
      key: 'title',
      label: 'Cim',
      required: true,
      type: 'string',
    },
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
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('createTopic', () => {
  it('creates a topic document under the topics collection', async () => {
    const docRef = { id: 'topic-doc-ref' };

    vi.mocked(doc).mockReturnValue(docRef as never);
    vi.mocked(setDoc).mockResolvedValue(undefined as never);

    await createTopic({
      topicId: 'art-topic',
      values: topicValues,
    });

    expect(doc).toHaveBeenCalledWith({ name: 'mock-db' }, 'topics', 'art-topic');
    expect(setDoc).toHaveBeenCalledWith(docRef, topicValues);
  });
});

describe('updateTopic', () => {
  it('updates an existing topic document under the topics collection', async () => {
    const docRef = { id: 'topic-doc-ref' };

    vi.mocked(doc).mockReturnValue(docRef as never);
    vi.mocked(updateDoc).mockResolvedValue(undefined as never);

    await updateTopic({
      topicId: 'art-topic',
      values: topicValues,
    });

    expect(doc).toHaveBeenCalledWith({ name: 'mock-db' }, 'topics', 'art-topic');
    expect(updateDoc).toHaveBeenCalledWith(docRef, topicValues);
  });
});
