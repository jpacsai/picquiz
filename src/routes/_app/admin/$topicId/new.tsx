import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicPage from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemPage';

const path = '/_app/admin/$topicId/new';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <AdminTopicPage topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return { topic, title: topic.label, subtitle: 'Új elem feltöltése' };
  },
  component: RouteComponent,
});
