import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/$topicId/items/';

export const Route = createFileRoute(path)({
  beforeLoad: ({ params, search }) => {
    const normalizedSearch = search as Record<string, unknown>;

    throw redirect({
      params,
      search: {
        saved: normalizedSearch.saved === 'edited' ? 'edited' : undefined,
      },
      to: '/$topicId/items',
    });
  },
});
