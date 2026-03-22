import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import QuizConfig from '@/components/pages/Quiz/QuizConfig';

const path = '/_app/$topicId/quiz-config';

const RouteComponent = () => {
  const { items, topic } = useLoaderData({ from: path });

  return <QuizConfig items={items} topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));
    const items = await queryClient.ensureQueryData(topicItemsOptions(topic.slug));

    return {
      items,
      topic,
      title: topic.label,
    };
  },
  component: RouteComponent,
});
