import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicPage from '@/components/pages/Admin/AdminTopicPage';

const path = '/_app/admin/$topicId/';

const RouteComponent = () => {
  const { itemCount, topic } = useLoaderData({ from: path });

  return <AdminTopicPage itemCount={itemCount} topic={topic} />;
};

export const Route = createFileRoute('/_app/admin/$topicId/')({
  loader: async ({ context: { queryClient }, params }) => {
    const topicId = params.topicId;
    const topic = await queryClient.ensureQueryData(topicOptions(topicId));
    const items = await queryClient.ensureQueryData(topicItemsOptions(topic.slug));

    return {
      itemCount: items.length,
      topic,
      title: topic.label,
    };
  },
  component: RouteComponent,
  shouldReload: true,
});
