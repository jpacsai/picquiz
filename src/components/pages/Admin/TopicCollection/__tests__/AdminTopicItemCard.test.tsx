import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import { QUERY_KEYS } from '@/queries/queryKeys';
import type { TopicField, TopicItem } from '@/types/topics';

import AdminTopicItemCard from '../components/AdminTopicItemCard';

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
  { key: 'image_path_desktop', label: 'Image path - desktop', readonly: true, type: 'string' },
  { key: 'image_path_mobile', label: 'Image path - mobile', readonly: true, type: 'string' },
  {
    buttonLabel: 'Upload image',
    fileNameFields: ['artist', 'title'],
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
  image_url_mobile: 'https://example.com/art/mobile/monalisa.jpg',
  title: 'Mona Lisa',
};

const renderAdminTopicItemCard = ({
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
          <AdminTopicItemCard
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

describe('AdminTopicItemCard UI', () => {
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

    renderAdminTopicItemCard({ queryClient });

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

    renderAdminTopicItemCard({ queryClient });

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

  it('renders boolean subtitle fields with the field label and false icon', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    const booleanSubtitleFields: TopicField[] = [
      { key: 'title', label: 'Title', required: true, type: 'string', display: 'title' },
      { key: 'self_portrait', label: 'Önarckép', type: 'boolean', display: 'subtitle' },
    ];

    const booleanSubtitleItem: TopicItem = {
      id: 'item-1',
      self_portrait: false,
      title: 'Mona Lisa',
    };

    queryClient.setQueryData(QUERY_KEYS.ITEMS.byTopic('art'), [booleanSubtitleItem]);
    queryClient.setQueryData(
      QUERY_KEYS.ITEMS.detail('art', booleanSubtitleItem.id),
      booleanSubtitleItem,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ThemePresetProvider>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <AdminTopicItemCard
              collectionName="art"
              fields={booleanSubtitleFields}
              item={booleanSubtitleItem}
              topicId="art-topic"
            />
          </SnackbarProvider>
        </ThemePresetProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Önarckép: Hamis' })).toBeInTheDocument();
  });

  it('opens the uploaded mobile image in a preview dialog from the item card', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    renderAdminTopicItemCard({ queryClient });

    await user.click(screen.getByRole('button', { name: 'Mobilkép megnyitása' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Mona Lisa mobil kep' })).toHaveAttribute(
      'src',
      'https://example.com/art/mobile/monalisa.jpg',
    );
  });

  it('does not render the mobile image preview button when the item has no mobile image url', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    renderAdminTopicItemCard({
      queryClient,
      itemOverride: {
        ...item,
        image_url_mobile: '',
      },
    });

    expect(screen.queryByRole('button', { name: 'Mobilkép megnyitása' })).not.toBeInTheDocument();
  });

  it('omits subtitle fallback when no subtitle display field is configured and shows meta directly under the title', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false },
      },
    });

    const metaOnlyFields: TopicField[] = [
      { key: 'title', label: 'Title', required: true, type: 'string', display: 'title' },
      { key: 'era', label: 'Era', type: 'string', display: 'meta' },
      { key: 'artist', label: 'Artist', type: 'string' },
    ];

    const metaOnlyItem: TopicItem = {
      artist: 'Leonardo da Vinci',
      era: 'Reneszánsz',
      id: 'item-1',
      title: 'Mona Lisa',
    };

    queryClient.setQueryData(QUERY_KEYS.ITEMS.byTopic('art'), [metaOnlyItem]);
    queryClient.setQueryData(QUERY_KEYS.ITEMS.detail('art', metaOnlyItem.id), metaOnlyItem);

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ThemePresetProvider>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <AdminTopicItemCard
              collectionName="art"
              fields={metaOnlyFields}
              item={metaOnlyItem}
              topicId="art-topic"
            />
          </SnackbarProvider>
        </ThemePresetProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
    expect(screen.getByText('Reneszánsz')).toBeInTheDocument();
    expect(screen.queryByText('Leonardo da Vinci')).not.toBeInTheDocument();

    const body2Elements = container.querySelectorAll('.MuiTypography-body2');
    expect(body2Elements).toHaveLength(0);
  });
});
