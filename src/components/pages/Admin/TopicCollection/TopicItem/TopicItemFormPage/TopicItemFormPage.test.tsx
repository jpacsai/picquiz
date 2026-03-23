import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Topic, TopicItem } from '@/types/topics';

import {
  getAutocompleteOptionsByField,
  mergeRefreshedSelectFieldOptions,
} from './TopicItemForm/utils';
import AdminTopicItemFormPage from './TopicItemFormPage';

const fetchQueryMock = vi.fn();
const listTopicItemsMock = vi.fn();
const topicItemFormMock = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');

  return {
    ...actual,
    useQueryClient: () => ({
      fetchQuery: (...args: unknown[]) => fetchQueryMock(...args),
    }),
  };
});

vi.mock('@service/items', async () => {
  const actual = await vi.importActual('@service/items');

  return {
    ...actual,
    listTopicItems: (...args: unknown[]) => listTopicItemsMock(...args),
  };
});

vi.mock(
  '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemFormPage/TopicItemForm/TopicItemForm',
  () => ({
    default: (props: Record<string, unknown>) => {
      topicItemFormMock(props);

      return (
        <div>
          <button
            type="button"
            aria-label="Selectek frissítése"
            onClick={props.onRefreshSelectOptions as () => void}
          >
            Refresh select options
          </button>
          <div data-testid="field-options">
            {JSON.stringify(
              (props.fields as Array<{ key: string; options?: string[] }>).map((field) => ({
                key: field.key,
                options: field.options,
              })),
            )}
          </div>
        </div>
      );
    },
  }),
);

const topic: Topic = {
  id: 'art-topic',
  label: 'Art',
  slug: 'art',
  storage_prefix: 'art',
  fields: [
    { key: 'artist', label: 'Artist', type: 'string', required: true, autocomplete: true },
    { key: 'movement', label: 'Movement', type: 'select', options: ['Baroque', 'Renaissance'] },
  ],
};

describe('mergeRefreshedSelectFieldOptions', () => {
  it('updates only select field options from the refreshed topic', () => {
    expect(
      mergeRefreshedSelectFieldOptions({
        currentFields: [
          { key: 'artist', label: 'Artist', type: 'string', required: true },
          { key: 'movement', label: 'Movement', type: 'select', options: ['Old'] },
        ],
        refreshedFields: [
          { key: 'artist', label: 'Artist', type: 'string', required: true },
          { key: 'movement', label: 'Movement', type: 'select', options: ['New', 'Newest'] },
        ],
      }),
    ).toEqual([
      { key: 'artist', label: 'Artist', type: 'string', required: true },
      { key: 'movement', label: 'Movement', type: 'select', options: ['New', 'Newest'] },
    ]);
  });
});

describe('getAutocompleteOptionsByField', () => {
  it('collects unique trimmed values only for autocomplete-enabled string fields', () => {
    const items: TopicItem[] = [
      { id: 'item-1', artist: ' Leonardo da Vinci ', movement: 'Renaissance' },
      { id: 'item-2', artist: 'Leonardo da Vinci', movement: 'Renaissance' },
      { id: 'item-3', artist: 'Michelangelo', movement: 'High Renaissance' },
      { id: 'item-4', artist: 123 },
    ];

    expect(
      getAutocompleteOptionsByField({
        currentItemId: 'item-2',
        fields: topic.fields,
        items,
      }),
    ).toEqual({
      artist: ['Leonardo da Vinci', 'Michelangelo'],
    });
  });
});

describe('AdminTopicItemFormPage', () => {
  it('refreshes select options from the db and passes them to the form', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    listTopicItemsMock.mockResolvedValue([]);

    fetchQueryMock.mockResolvedValue({
      ...topic,
      fields: [
        { key: 'artist', label: 'Artist', type: 'string', required: true },
        {
          key: 'movement',
          label: 'Movement',
          type: 'select',
          options: ['Impressionism', 'Cubism'],
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminTopicItemFormPage topic={topic} />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Selectek frissítése' }));

    await waitFor(() => {
      expect(fetchQueryMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('field-options')).toHaveTextContent('Impressionism');
    expect(screen.getByTestId('field-options')).toHaveTextContent('Cubism');
  });

  it('passes autocomplete options only for fields flagged in the db schema', async () => {
    const queryClient = new QueryClient();

    listTopicItemsMock.mockResolvedValue([
      { id: 'item-1', artist: 'Leonardo da Vinci', movement: 'Renaissance' },
      { id: 'item-2', artist: 'Michelangelo', movement: 'High Renaissance' },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminTopicItemFormPage topic={topic} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(topicItemFormMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          autocompleteOptionsByField: {
            artist: ['Leonardo da Vinci', 'Michelangelo'],
          },
        }),
      );
    });
  });
});
