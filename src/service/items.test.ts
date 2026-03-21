import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTopicItem, getTopicItem, updateTopicItem } from './items';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  db: { name: 'mock-db' },
}));

describe('createTopicItem', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

describe('getTopicItem', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the requested item with its document id', async () => {
    const docRef = { id: 'doc-ref' };
    const snap = {
      data: () => ({ artist: 'Leonardo da Vinci', title: 'Mona Lisa' }),
      exists: () => true,
      id: 'item-1',
    };

    vi.mocked(doc).mockReturnValue(docRef as never);
    vi.mocked(getDoc).mockResolvedValue(snap as never);

    await expect(getTopicItem({ collectionName: 'art', itemId: 'item-1' })).resolves.toEqual({
      artist: 'Leonardo da Vinci',
      id: 'item-1',
      title: 'Mona Lisa',
    });

    expect(doc).toHaveBeenCalledWith({ name: 'mock-db' }, 'art', 'item-1');
    expect(getDoc).toHaveBeenCalledWith(docRef);
  });

  it('throws when the requested item does not exist', async () => {
    const docRef = { id: 'doc-ref' };
    const snap = {
      exists: () => false,
    };

    vi.mocked(doc).mockReturnValue(docRef as never);
    vi.mocked(getDoc).mockResolvedValue(snap as never);

    await expect(getTopicItem({ collectionName: 'art', itemId: 'missing' })).rejects.toThrow(
      'Not found',
    );
  });
});

describe('updateTopicItem', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates the requested document with an updated_at timestamp', async () => {
    const docRef = { id: 'doc-ref' };
    const timestamp = { kind: 'server-timestamp' };

    vi.mocked(doc).mockReturnValue(docRef as never);
    vi.mocked(serverTimestamp).mockReturnValue(timestamp as never);
    vi.mocked(updateDoc).mockResolvedValue(undefined as never);

    await updateTopicItem({
      collectionName: 'art',
      itemId: 'item-1',
      values: {
        artist: 'Leonardo da Vinci',
        title: 'Mona Lisa',
      },
    });

    expect(doc).toHaveBeenCalledWith({ name: 'mock-db' }, 'art', 'item-1');
    expect(updateDoc).toHaveBeenCalledWith(docRef, {
      artist: 'Leonardo da Vinci',
      title: 'Mona Lisa',
      updated_at: timestamp,
    });
  });
});
