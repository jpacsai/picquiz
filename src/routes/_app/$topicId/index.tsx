import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import Quiz from '../../../components/pages/Quiz/Quiz';
import { topicsOptions } from '../../../queries/topics';

const path = '/_app/$topicId/';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <Quiz topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context, params }) => {
    const topicId = params.topicId;
    const topics = await context.queryClient.ensureQueryData(topicsOptions());
    const topic = topics.find(({ id }) => id === topicId);
    return { topic };
  },
  component: RouteComponent,
});
