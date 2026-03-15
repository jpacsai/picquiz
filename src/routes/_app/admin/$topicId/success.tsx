import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminSuccess from '../../../../components/pages/Admin/AdminSuccess';
import { topicOptions } from '../../../../queries/topics';

const path = '/_app/admin/$topicId/success';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <AdminSuccess topicId={topic.id} topicLabel={topic.label} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return {
      topic,
      title: 'Sikeres mentés',
    };
  },
  component: RouteComponent,
});
