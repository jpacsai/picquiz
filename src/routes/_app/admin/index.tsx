import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import Admin from '../../../components/pages/Admin/Admin';
import { topicsOptions } from '../../../queries/topics';

const path = '/_app/admin/';

const RouteComponent = () => {
  const { topics } = useLoaderData({ from: path });

  return <Admin topics={topics} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient } }) => {
    const topics = await queryClient.ensureQueryData(topicsOptions());

    return { topics, title: 'Admin' };
  },
  component: RouteComponent,
});
