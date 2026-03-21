import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminPage from '../../../components/pages/Admin/AdminPage';
import { topicsOptions } from '../../../queries/topics';

const path = '/_app/admin/';

const RouteComponent = () => {
  const { topics } = useLoaderData({ from: path });

  return <AdminPage topics={topics} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient } }) => {
    const topics = await queryClient.ensureQueryData(topicsOptions());

    return { topics, title: 'Admin' };
  },
  component: RouteComponent,
});
