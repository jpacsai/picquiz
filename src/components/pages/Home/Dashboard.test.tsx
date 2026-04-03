import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ThemePresetProvider } from '@/lib/theme/ThemePresetProvider';
import type { Topic } from '@/types/topics';

import Dashboard from './Dashboard';

const topics: ReadonlyArray<Topic> = [
  {
    fields: [],
    id: 'art',
    label: 'Művészet',
    slug: 'art',
    storage_prefix: 'art',
  },
  {
    fields: [],
    id: 'history',
    label: 'Történelem',
    slug: 'history',
    storage_prefix: 'history',
  },
];

const RootComponent = () => <Outlet />;

const TopicRouteComponent = () => <div>Topic page</div>;
const NewSchemaRouteComponent = () => <div>New schema page</div>;
const DuplicateSchemaRouteComponent = () => <div>Duplicate schema page</div>;

const renderDashboard = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: RootComponent,
  });

  const homeRoute = createRoute({
    component: () => <Dashboard topics={topics} />,
    getParentRoute: () => rootRoute,
    path: '/',
  });

  const topicRoute = createRoute({
    component: TopicRouteComponent,
    getParentRoute: () => rootRoute,
    path: '/$topicId',
  });

  const newSchemaRoute = createRoute({
    component: NewSchemaRouteComponent,
    getParentRoute: () => rootRoute,
    path: '/schemas/new',
  });

  const duplicateSchemaRoute = createRoute({
    component: DuplicateSchemaRouteComponent,
    getParentRoute: () => rootRoute,
    path: '/schemas/$topicId/duplicate',
  });

  const routeTree = rootRoute.addChildren([homeRoute, topicRoute, newSchemaRoute, duplicateSchemaRoute]);

  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ['/'] }),
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

describe('Dashboard integration', () => {
  it('navigates to the selected topic when the topic card is clicked', async () => {
    const user = userEvent.setup();

    const { router } = await renderDashboard();

    await user.click(screen.getByTestId('topic-card-art'));

    expect(await screen.findByText('Topic page')).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/art');
    });
  });

  it('opens schema creation from the new topic action', async () => {
    const user = userEvent.setup();

    const { router } = await renderDashboard();

    await user.click(screen.getByRole('button', { name: 'Új topic' }));
    await user.click(screen.getByRole('button', { name: 'Létrehozás folytatása' }));

    expect(await screen.findByText('New schema page')).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/schemas/new');
    });
  });

  it('lets the user duplicate an existing schema from the new topic action', async () => {
    const user = userEvent.setup();

    const { router } = await renderDashboard();

    await user.click(screen.getByRole('button', { name: 'Új topic' }));
    await user.click(screen.getByRole('radio', { name: 'Meglévő séma duplikálása' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Művészet' }));
    await user.click(screen.getByRole('button', { name: 'Duplikálás folytatása' }));

    expect(await screen.findByText('Duplicate schema page')).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/schemas/art/duplicate');
    });
  });
});
