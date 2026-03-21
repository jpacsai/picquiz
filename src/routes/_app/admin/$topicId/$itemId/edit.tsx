import { topicItemOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicPage from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemPage';

const path = '/_app/admin/$topicId/$itemId/edit';

const RouteComponent = () => {
  const { item, topic } = useLoaderData({ from: path });

  return <AdminTopicPage initialValues={item} item={item} mode="edit" topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));
    const item = await queryClient.ensureQueryData(topicItemOptions(topic.slug, params.itemId));

    return {
      item,
      title: topic.label,
      topic,
      subtitle: 'Elem szerkesztése',
    };
  },
  component: RouteComponent,
  shouldReload: true,
});
