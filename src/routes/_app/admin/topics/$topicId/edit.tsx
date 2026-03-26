import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/topics/$topicId/edit';

export const Route = createFileRoute(path)({
  beforeLoad: ({ params }) => {
    throw redirect({
      params,
      to: '/admin/$topicId/schema',
    });
  },
});
