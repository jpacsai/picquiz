import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Topic } from '@/types/topics';

import { mergeRefreshedSelectFieldOptions } from './TopicItemForm/utils';
import AdminTopicItemFormPage from './TopicItemFormPage';

const fetchQueryMock = vi.fn();
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
    { key: 'artist', label: 'Artist', type: 'string', required: true },
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

describe('AdminTopicItemFormPage', () => {
  it('refreshes select options from the db and passes them to the form', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

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
});
