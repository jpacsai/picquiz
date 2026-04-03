import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/schemas/';

export const Route = createFileRoute(path)({
  beforeLoad: () => {
    throw redirect({
      to: '/schemas/new',
    });
  },
});
