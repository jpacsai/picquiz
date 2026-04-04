import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE } from '@/consts/admin';
import type { Topic, TopicItem } from '@/types/topics';

import AdminTopicCollectionPage from '../TopicCollectionPage';

const navigateMock = vi.fn();
const enqueueSnackbarMock = vi.fn();

vi.mock('@/consts/admin', async () => {
  const actual = await vi.importActual('@/consts/admin');

  return {
    ...actual,
    ADMIN_TOPIC_COLLECTION_SEARCH_DEBOUNCE_MS: 0,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');

  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: enqueueSnackbarMock }),
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');

  return {
    ...actual,
    useQuery: ({ initialData }: { initialData: unknown }) => ({ data: initialData }),
  };
});

vi.mock('@/components/pages/Admin/TopicCollection/components/AdminTopicItemCard', () => ({
  default: ({ item }: { item: TopicItem }) => {
    const label = typeof item.title === 'string' ? item.title : item.id;

    return <div>{label}</div>;
  },
}));

const topic: Topic = {
  fields: [
    {
      display: 'title',
      key: 'title',
      label: 'Cím',
      quiz: { enabled: true, prompt: 'Mi a cim?' },
      type: 'string',
    },
    {
      display: 'subtitle',
      key: 'artist',
      label: 'Alkotó',
      quiz: { enabled: true, prompt: 'Ki az alkoto?' },
      type: 'string',
    },
    {
      hideInEdit: true,
      key: 'year',
      label: 'Év',
      quiz: { enabled: true, prompt: 'Melyik ev?' },
      type: 'number',
    },
  ],
  id: 'art',
  label: 'Műalkotások',
  slug: 'art',
  storage_prefix: 'art',
};

const items: TopicItem[] = [
  {
    artist: 'Leonardo da Vinci',
    created_at: { seconds: 100 },
    id: '1',
    title: 'Mona Lisa',
    year: 1503,
  },
  {
    artist: 'Vincent van Gogh',
    created_at: { seconds: 200 },
    id: '2',
    title: 'Csillagos ég',
    year: 1889,
  },
  {
    artist: 'Claude Monet',
    created_at: { seconds: 300 },
    id: '3',
    title: 'Tavirózsák',
    year: 1906,
  },
];

describe('AdminTopicCollectionPage', () => {
  const getSearchInput = () => screen.getByRole('combobox', { name: 'Keresett érték' });
  const getDisplayedCount = (filteredCount: number, totalCount = items.length) =>
    screen.getByText(`${totalCount} / ${filteredCount} elem`);

  beforeEach(() => {
    navigateMock.mockReset();
    enqueueSnackbarMock.mockReset();
    window.localStorage.clear();
  });

  it('filters the rendered list by the selected field', async () => {
    const user = userEvent.setup();

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    expect(getDisplayedCount(3)).toBeInTheDocument();
    expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
    expect(screen.getByText('Csillagos ég')).toBeInTheDocument();
    expect(screen.getByText('Tavirózsák')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Keresés mező szerint' }));
    await user.click(screen.getByRole('option', { name: 'Alkotó' }));
    await user.type(getSearchInput(), 'vin');

    await waitFor(
      () => {
        expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
        expect(screen.getByText('Csillagos ég')).toBeInTheDocument();
        expect(screen.queryByText('Tavirózsák')).not.toBeInTheDocument();
        expect(getDisplayedCount(2)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('does not list hidden quiz fields in the search selector', async () => {
    const user = userEvent.setup();

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    await user.click(screen.getByRole('combobox', { name: 'Keresés mező szerint' }));

    expect(screen.getByRole('option', { name: 'Cím' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Alkotó' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Év' })).not.toBeInTheDocument();
  });

  it('shows a no-results message when nothing matches the query', async () => {
    const user = userEvent.setup();

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    await user.type(getSearchInput(), 'nem letezik');
    await waitFor(
      () => {
        const message = screen.getByText(/Nincs találat a kiválasztott mezőben erre:/);
        expect(message).toBeInTheDocument();
        expect(within(message).getByText('nem letezik')).toBeInTheDocument();
        expect(screen.queryByText('Mona Lisa')).not.toBeInTheDocument();
        expect(getDisplayedCount(0)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('resets the filter to its default state when the reset button is clicked', async () => {
    const user = userEvent.setup();

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    await user.click(screen.getByRole('combobox', { name: 'Keresés mező szerint' }));
    await user.click(screen.getByRole('option', { name: 'Alkotó' }));
    await user.type(getSearchInput(), 'claude');

    await waitFor(() => {
      expect(getDisplayedCount(1)).toBeInTheDocument();
      expect(screen.queryByText('Mona Lisa')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Szűrő visszaállítása' }));

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Keresés mező szerint' })).toHaveTextContent(
        'Cím',
      );
      expect(getSearchInput()).toHaveValue('');
      expect(getDisplayedCount(3)).toBeInTheDocument();
      expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
      expect(screen.getByText('Csillagos ég')).toBeInTheDocument();
      expect(screen.getByText('Tavirózsák')).toBeInTheDocument();
    });
  });

  it('restores the previously saved filter state on a new mount', async () => {
    window.localStorage.setItem('picquiz-admin-topic-collection-search-field-art', 'artist');
    window.localStorage.setItem('picquiz-admin-topic-collection-search-query-art', 'claude');

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Keresés mező szerint' })).toHaveTextContent(
        'Alkotó',
      );
      expect(getSearchInput()).toHaveValue('claude');
      expect(getDisplayedCount(1)).toBeInTheDocument();
      expect(screen.getByText('Tavirózsák')).toBeInTheDocument();
      expect(screen.queryByText('Mona Lisa')).not.toBeInTheDocument();
    });
  });

  it('shows the newest items first by default', () => {
    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    const renderedTitles = screen
      .getAllByText(/Mona Lisa|Csillagos ég|Tavirózsák/)
      .map((element) => element.textContent);

    expect(renderedTitles).toEqual(['Tavirózsák', 'Csillagos ég', 'Mona Lisa']);
  });

  it('paginates the filtered list with the configured page size', async () => {
    const user = userEvent.setup();
    const manyItems: TopicItem[] = Array.from(
      { length: ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE + 5 },
      (_, index) => ({
        artist: `Artist ${index + 1}`,
        created_at: { seconds: index + 1 },
        id: String(index + 1),
        title: `Item ${index + 1}`,
        year: 1900 + index,
      }),
    );

    render(<AdminTopicCollectionPage items={manyItems} topic={topic} />);

    expect(screen.getByText(`Item ${ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE + 5}`)).toBeInTheDocument();
    expect(screen.getByText('Item 6')).toBeInTheDocument();
    expect(screen.queryByText('Item 5')).not.toBeInTheDocument();
    expect(screen.getByTestId('topic-collection-pagination')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2. oldal' }));

    await waitFor(() => {
      expect(screen.getByText('Item 5')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(
        screen.queryByText(`Item ${ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE + 5}`),
      ).not.toBeInTheDocument();
    });
  });
});
