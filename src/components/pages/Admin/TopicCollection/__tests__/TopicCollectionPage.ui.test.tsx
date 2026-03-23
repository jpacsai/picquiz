import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Topic, TopicItem } from '@/types/topics';

import AdminTopicCollectionPage from '../TopicCollectionPage';

const navigateMock = vi.fn();
const enqueueSnackbarMock = vi.fn();

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

  it('filters the rendered list by the selected field', async () => {
    const user = userEvent.setup();

    render(<AdminTopicCollectionPage items={items} topic={topic} />);

    expect(screen.getByText('Jelenleg megjelenítve: 3 elem')).toBeInTheDocument();
    expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
    expect(screen.getByText('Csillagos ég')).toBeInTheDocument();
    expect(screen.getByText('Tavirózsák')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Keresés mező szerint' }));
    await user.click(screen.getByRole('option', { name: 'Alkotó' }));
    await user.type(getSearchInput(), 'vin');

    expect(screen.getByText('Tavirózsák')).toBeInTheDocument();
    await waitFor(
      () => {
        expect(screen.getByText('Mona Lisa')).toBeInTheDocument();
        expect(screen.getByText('Csillagos ég')).toBeInTheDocument();
        expect(screen.queryByText('Tavirózsák')).not.toBeInTheDocument();
        expect(screen.getByText('Jelenleg megjelenítve: 2 elem')).toBeInTheDocument();
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
        expect(screen.getByText('Jelenleg megjelenítve: 0 elem')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
