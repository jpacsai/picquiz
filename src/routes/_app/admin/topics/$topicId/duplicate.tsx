import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/topics/$topicId/duplicate';

export const Route = createFileRoute(path)({
  beforeLoad: ({ params }) => {
    throw redirect({
      params,
      to: '/admin/schemas/$topicId/duplicate',
    });
  },
});
