import { topicItemOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import TopicItemPage from '@/components/pages/Admin/TopicItem/TopicItemPage';
import { getTopicItemTitle } from '@/components/pages/Admin/TopicItem/utils';

const path = '/_app/$topicId/items/$itemId/';

const RouteComponent = () => {
  const { item, topic } = useLoaderData({ from: path });

  return <TopicItemPage item={item} topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));
    const item = await queryClient.ensureQueryData(topicItemOptions(topic.slug, params.itemId));
    const itemLabel = getTopicItemTitle(topic.fields, item);

    return {
      item,
      itemLabel,
      title: topic.label,
      topic,
      subtitle: itemLabel,
    };
  },
  component: RouteComponent,
  shouldReload: true,
});
