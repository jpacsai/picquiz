import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import AdminTopicCollection from '@components/pages/Admin/AdminTopicCollection';
import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';

const path = '/_app/admin/$topicId/';

const parseSearch = (search: Record<string, unknown>) =>
  ({ saved: search.saved === 'edited' ? 'edited' : undefined }) as const;

const RouteComponent = () => {
  const { items, topic } = useLoaderData({ from: path });
  const { saved } = Route.useSearch();

  return <AdminTopicCollection items={items} saved={saved} topic={topic} />;
};

export const Route = createFileRoute('/_app/admin/$topicId/')({
  loader: async ({ context: { queryClient }, params }) => {
    const topicId = params.topicId;
    const topic = await queryClient.ensureQueryData(topicOptions(topicId));
    const items = await queryClient.ensureQueryData(topicItemsOptions(topic.slug));

    return {
      items,
      topic,
      title: topic.label,
      subtitle: `${items.length} item`,
    };
  },
  component: RouteComponent,
  shouldReload: true,
  validateSearch: parseSearch,
});
