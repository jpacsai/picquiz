import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import TopicSchemaBuilderPage from '@/components/pages/Admin/TopicSchemaBuilder/TopicSchemaBuilderPage';
import { topicOptions } from '@/queries/topics';

const path = '/_app/newTopic';

const parseSearch = (search: Record<string, unknown>) =>
  ({
    sourceTopicId:
      typeof search.sourceTopicId === 'string' && search.sourceTopicId.trim().length > 0
        ? search.sourceTopicId
        : undefined,
  }) as const;

const RouteComponent = () => {
  const { sourceTopic } = useLoaderData({ from: path });

  return <TopicSchemaBuilderPage mode="create" sourceTopic={sourceTopic} />;
};

export const Route = createFileRoute(path)({
  component: RouteComponent,
  loaderDeps: ({ search }) => ({
    sourceTopicId: search.sourceTopicId,
  }),
  loader: async ({ context: { queryClient }, deps }) => {
    const sourceTopic = deps.sourceTopicId
      ? await queryClient.ensureQueryData(topicOptions(deps.sourceTopicId))
      : undefined;

    return {
      sourceTopic,
      title: sourceTopic ? `${sourceTopic.label} séma másolása` : 'Új topic séma',
    };
  },
  validateSearch: parseSearch,
});
