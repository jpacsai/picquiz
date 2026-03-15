import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';

import { createTopicItem } from './items';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  db: { name: 'mock-db' },
}));

describe('createTopicItem', () => {
  it('creates a document in the requested collection with a created_at timestamp', async () => {
    const collectionRef = { id: 'art-ref' };
    const timestamp = { kind: 'server-timestamp' };

    vi.mocked(collection).mockReturnValue(collectionRef as never);
    vi.mocked(serverTimestamp).mockReturnValue(timestamp as never);
    vi.mocked(addDoc).mockResolvedValue({ id: 'doc-1' } as never);

    await createTopicItem({
      collectionName: 'art',
      values: {
        artist: 'Leonardo da Vinci',
        title: 'Mona Lisa',
      },
    });

    expect(collection).toHaveBeenCalledWith({ name: 'mock-db' }, 'art');
    expect(addDoc).toHaveBeenCalledWith(collectionRef, {
      artist: 'Leonardo da Vinci',
      title: 'Mona Lisa',
      created_at: timestamp,
    });
  });
});
