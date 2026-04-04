import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import { routeTree } from '@/routeTree.gen';
import type { Topic } from '@/types/topics';

vi.mock('@/auth/authStore', () => ({
  authStore: {
    onceReady: vi.fn().mockResolvedValue({
      ready: true,
      user: { uid: 'test-user' },
    }),
  },
}));

vi.mock('@queries/topics', () => ({
  topicOptions: (topicId: string) => ({
    queryFn: async () =>
      ({
        fields: [],
        id: topicId,
        label: 'Művészet',
        slug: 'art',
        storage_prefix: 'art',
      }) satisfies Topic,
    queryKey: ['topic', topicId],
  }),
}));

vi.mock('@queries/items', () => ({
  topicItemOptions: (collectionName: string, itemId: string) => ({
    queryFn: async () => ({
      id: itemId,
      image: null,
      name: `${collectionName}-${itemId}`,
      values: {},
    }),
    queryKey: ['item', collectionName, itemId],
  }),
}));

vi.mock('@/components/pages/Admin/TopicItemFormPage/TopicItemFormPage', () => ({
  default: () => <div>Mock item edit page</div>,
}));

const renderBreadcrumbs = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ['/art/items/item-1/edit'] }),
    routeTree,
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ThemePresetProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemePresetProvider>
    </QueryClientProvider>,
  );

  await router.load();

  return { router };
};

describe('AppBreadcrumbs integration', () => {
  it('renders a link back to the items page on the item edit route', async () => {
    const { router } = await renderBreadcrumbs();

    expect(await screen.findByText('Mock item edit page')).toBeInTheDocument();

    const breadcrumbs = screen.getByLabelText('breadcrumb');
    const itemsLink = within(breadcrumbs).getByRole('link', { name: 'Elemek' });

    expect(itemsLink).toHaveAttribute('href', '/art/items');
    expect(within(breadcrumbs).getByText('Művészet')).toBeInTheDocument();
    expect(within(breadcrumbs).getByText('Szerkesztés')).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/art/items/item-1/edit');
    });
  });
});
