import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import QuizConfig from '@/components/pages/Quiz/QuizConfig';

const path = '/_app/$topicId/quiz-config';

const RouteComponent = () => {
  const { topic } = useLoaderData({ from: path });

  return <QuizConfig topic={topic} />;
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));

    return {
      topic,
      title: topic.label,
      subtitle: 'Kvíz beállításai',
    };
  },
  component: RouteComponent,
});
