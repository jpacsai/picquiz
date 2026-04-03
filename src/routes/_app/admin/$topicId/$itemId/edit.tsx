import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/$topicId/$itemId/edit';

export const Route = createFileRoute(path)({
  beforeLoad: ({ params }) => {
    throw redirect({
      params,
      to: '/$topicId/items/$itemId/edit',
    });
  },
});
