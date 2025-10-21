import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import Dashboard from '../../components/pages/Dashboard';
import { topicsOptions } from '../../queries/topics';

export const parentPath = "/_app/home";

const RouteComponent = () => {
  const { topics } = useLoaderData({ from: parentPath });

  return <Dashboard topics={topics} />;
};

export const Route = createFileRoute(parentPath)({
  loader: async ({ context: { queryClient } }) => {
    const topics = await queryClient.ensureQueryData(topicsOptions());

    return { topics };
  },
  component: RouteComponent,
});
