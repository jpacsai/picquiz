import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/$topicId/success';

export const Route = createFileRoute(path)({
  beforeLoad: ({ params }) => {
    throw redirect({
      params,
      to: '/admin/$topicId/items/success',
    });
  },
});
