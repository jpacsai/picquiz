import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TopicField } from '@/types/topics';

import AdminTopicItem from './AdminTopicItem';

const navigateMock = vi.fn();
const setQueryDataMock = vi.fn();
const removeQueriesMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const enqueueSnackbarMock = vi.fn();
const deleteTopicItemMock = vi.fn();
const deleteTopicImageByPathMock = vi.fn();
const confirmMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
    removeQueries: removeQueriesMock,
    setQueryData: setQueryDataMock,
  }),
}));

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: enqueueSnackbarMock,
  }),
}));

vi.mock('@service/items', () => ({
  deleteTopicItem: (...args: unknown[]) => deleteTopicItemMock(...args),
}));

vi.mock('@data/storage', () => ({
  deleteTopicImageByPath: (...args: unknown[]) => deleteTopicImageByPathMock(...args),
}));

describe('AdminTopicItem', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    setQueryDataMock.mockReset();
    removeQueriesMock.mockReset();
    invalidateQueriesMock.mockReset();
    enqueueSnackbarMock.mockReset();
    deleteTopicItemMock.mockReset();
    deleteTopicImageByPathMock.mockReset();

    deleteTopicItemMock.mockResolvedValue(undefined);
    deleteTopicImageByPathMock.mockResolvedValue(undefined);
    invalidateQueriesMock.mockResolvedValue(undefined);
    confirmMock.mockReset();
    confirmMock.mockReturnValue(true);
  });

  Object.defineProperty(window, 'confirm', {
    configurable: true,
    value: confirmMock,
    writable: true,
  });

  it('deletes the item from the list view and cleans up image paths', async () => {
    const user = userEvent.setup();
    const fields: TopicField[] = [
      {
        key: 'artist',
        label: 'Artist',
        required: true,
        type: 'string',
        display: 'subtitle',
      },
      { key: 'title', label: 'Title', required: true, type: 'string', display: 'title' },
      { key: 'image_path_desktop', label: 'Desktop path', readonly: true, type: 'string' },
      { key: 'image_path_mobile', label: 'Mobile path', readonly: true, type: 'string' },
      {
        buttonLabel: 'Upload image',
        fileNameFields: { artist: 'artist', title: 'title' },
        key: 'image_upload',
        label: 'Upload image',
        targetFields: {
          desktop: 'image_url_desktop',
          mobile: 'image_url_mobile',
          desktopPath: 'image_path_desktop',
          mobilePath: 'image_path_mobile',
        },
        type: 'imageUpload',
      },
    ];

    render(
      <AdminTopicItem
        collectionName="art"
        fields={fields}
        item={{
          artist: 'Leonardo da Vinci',
          id: 'item-1',
          image_path_desktop: 'art/desktop/monalisa.jpg',
          image_path_mobile: 'art/mobile/monalisa.jpg',
          title: 'Mona Lisa',
        }}
        topicId="art-topic"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Torles' }));

    await waitFor(() => {
      expect(deleteTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        itemId: 'item-1',
      });
    });

    expect(setQueryDataMock).toHaveBeenCalledWith(['items', 'byTopic', 'art'], expect.any(Function));
    expect(removeQueriesMock).toHaveBeenCalledWith({
      queryKey: ['items', 'detail', { topic: 'art', id: 'item-1' }],
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['items', 'byTopic', 'art'],
    });
    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/desktop/monalisa.jpg');
    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/mobile/monalisa.jpg');
    expect(enqueueSnackbarMock).toHaveBeenCalledWith('Az elem torolve.', { variant: 'success' });
  });
});
