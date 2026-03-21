import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import { QUERY_KEYS } from '@/queries/queryKeys';
import type { TopicItem } from '@/service/items';
import type { TopicField } from '@/types/topics';

import AdminTopicItem from './AdminTopicItem';

const navigateMock = vi.fn();
const deleteTopicItemMock = vi.fn();
const deleteTopicImageByPathMock = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@service/items', async () => {
  const actual = await vi.importActual('@service/items');

  return {
    ...actual,
    deleteTopicItem: (...args: unknown[]) => deleteTopicItemMock(...args),
  };
});

vi.mock('@data/storage', async () => {
  const actual = await vi.importActual('@data/storage');

  return {
    ...actual,
    deleteTopicImageByPath: (...args: unknown[]) => deleteTopicImageByPathMock(...args),
  };
});

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

const item: TopicItem = {
  artist: 'Leonardo da Vinci',
  id: 'item-1',
  image_path_desktop: 'art/desktop/monalisa.jpg',
  image_path_mobile: 'art/mobile/monalisa.jpg',
  title: 'Mona Lisa',
};

const renderAdminTopicItem = ({
  queryClient,
  itemOverride,
}: {
  queryClient: QueryClient;
  itemOverride?: TopicItem;
}) => {
  const renderedItem = itemOverride ?? item;

  queryClient.setQueryData(QUERY_KEYS.ITEMS.byTopic('art'), [
    renderedItem,
    { id: 'item-2', title: 'The Last Supper' },
  ]);
  queryClient.setQueryData(QUERY_KEYS.ITEMS.detail('art', renderedItem.id), renderedItem);

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemePresetProvider>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <AdminTopicItem
            collectionName="art"
            fields={fields}
            item={renderedItem}
            topicId="art-topic"
          />
        </SnackbarProvider>
      </ThemePresetProvider>
    </QueryClientProvider>,
  );
};

describe('AdminTopicItem UI', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    deleteTopicItemMock.mockReset();
    deleteTopicImageByPathMock.mockReset();

    deleteTopicItemMock.mockResolvedValue(undefined);
    deleteTopicImageByPathMock.mockResolvedValue(undefined);
    window.localStorage.clear();
  });

  it('deletes an item through the confirmation dialog and updates the live query cache', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    renderAdminTopicItem({ queryClient });

    await user.click(screen.getByRole('button', { name: 'Törlés' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Elem törlése' })).toBeInTheDocument();
    expect(within(dialog).getByText('Mona Lisa')).toBeInTheDocument();
    expect(within(dialog).getByText('Leonardo da Vinci')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Törlés végleg' }));

    await waitFor(() => {
      expect(deleteTopicItemMock).toHaveBeenCalledWith({
        collectionName: 'art',
        itemId: 'item-1',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Az elem törölve.')).toBeInTheDocument();
    });

    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/desktop/monalisa.jpg');
    expect(deleteTopicImageByPathMock).toHaveBeenCalledWith('art/mobile/monalisa.jpg');
    expect(queryClient.getQueryData(QUERY_KEYS.ITEMS.detail('art', 'item-1'))).toBeUndefined();
    expect(queryClient.getQueryData(QUERY_KEYS.ITEMS.byTopic('art'))).toEqual([
      { id: 'item-2', title: 'The Last Supper' },
    ]);
  });

  it('closes the dialog without deleting when the user cancels', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    renderAdminTopicItem({ queryClient });

    await user.click(screen.getByRole('button', { name: 'Törlés' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Mégse' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(deleteTopicItemMock).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(QUERY_KEYS.ITEMS.detail('art', 'item-1'))).toEqual(item);
    expect(queryClient.getQueryData(QUERY_KEYS.ITEMS.byTopic('art'))).toEqual([
      item,
      { id: 'item-2', title: 'The Last Supper' },
    ]);
  });
});
