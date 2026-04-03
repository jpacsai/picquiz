import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import TopicSchemaBuilderPage from '@/components/pages/Admin/TopicSchemaBuilder/TopicSchemaBuilderPage';
import { topicOptions } from '@/queries/topics';

const path = '/_app/schemas/$topicId/duplicate';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <TopicSchemaBuilderPage mode="create" sourceTopic={topic} />;
};

export const Route = createFileRoute(path)({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return {
      title: `${topic.label} schema masolasa`,
      topic,
    };
  },
});
