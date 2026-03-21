import { deleteObject, ref } from 'firebase/storage';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteTopicImageByPath } from './storage';

vi.mock('firebase/storage', async () => {
  return {
    deleteObject: vi.fn(),
    ref: vi.fn(),
  };
});

vi.mock('../lib/firebase', () => ({
  storage: { name: 'mock-storage' },
}));

describe('deleteTopicImageByPath', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the storage object referenced by path', async () => {
    const storageRef = { fullPath: 'art/desktop/old-file.jpg' };

    vi.mocked(ref).mockReturnValue(storageRef as never);
    vi.mocked(deleteObject).mockResolvedValue(undefined as never);

    await deleteTopicImageByPath('art/desktop/old-file.jpg');

    expect(ref).toHaveBeenCalledWith({ name: 'mock-storage' }, 'art/desktop/old-file.jpg');
    expect(deleteObject).toHaveBeenCalledWith(storageRef);
  });
});
