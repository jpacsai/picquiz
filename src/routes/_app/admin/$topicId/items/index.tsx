import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicCollectionPage from '@/components/pages/Admin/TopicCollection/TopicCollectionPage';

const path = '/_app/admin/$topicId/items/';

const parseSearch = (search: Record<string, unknown>) =>
  ({ saved: search.saved === 'edited' ? 'edited' : undefined }) as const;

const RouteComponent = () => {
  const { items, topic } = useLoaderData({ from: path });
  const { saved } = Route.useSearch();

  return <AdminTopicCollectionPage items={items} saved={saved} topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));
    const items = await queryClient.ensureQueryData(topicItemsOptions(topic.slug));

    return {
      items,
      title: topic.label,
      topic,
    };
  },
  component: RouteComponent,
  shouldReload: true,
  validateSearch: parseSearch,
});
