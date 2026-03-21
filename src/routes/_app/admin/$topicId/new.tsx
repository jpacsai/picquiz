import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicItemFormPage from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemFormPage/TopicItemFormPage';

const path = '/_app/admin/$topicId/new';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <AdminTopicItemFormPage topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return { topic, title: topic.label, subtitle: 'Új elem feltöltése' };
  },
  component: RouteComponent,
});
