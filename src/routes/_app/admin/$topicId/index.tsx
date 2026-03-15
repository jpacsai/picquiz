import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import AdminTopic from '../../../../components/pages/Admin/AdminTopic';
import { topicOptions } from '../../../../queries/topics';

const path = '/_app/admin/$topicId/';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <AdminTopic topic={topic} />;
};

export const Route = createFileRoute('/_app/admin/$topicId/')({
  loader: async ({ context: { queryClient }, params }) => {
    const topicId = params.topicId;
    const topic = await queryClient.ensureQueryData(topicOptions(topicId));

    return { topic, title: topic.label, subtitle: 'Upload an item' };
  },
  component: RouteComponent,
});
