import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminSchemasPage from '@/components/pages/Admin/AdminSchemasPage';
import { topicsOptions } from '@/queries/topics';

const path = '/_app/admin/schemas/';

const RouteComponent = () => {
  const { topics } = useLoaderData({ from: path });

  return <AdminSchemasPage topics={topics} />;
};

export const Route = createFileRoute(path)({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const topics = await queryClient.ensureQueryData(topicsOptions());

    return {
      title: 'Sémák',
      topics,
    };
  },
});
