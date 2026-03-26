import { createFileRoute, redirect } from '@tanstack/react-router';

const path = '/_app/admin/topics/new';

export const Route = createFileRoute(path)({
  beforeLoad: () => {
    throw redirect({
      search: {
        schemaDialog: 'new',
        schemaMode: 'create',
        sourceTopicId: undefined,
      },
      to: '/admin',
    });
  },
});
