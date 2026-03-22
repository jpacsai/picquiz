import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import Quiz from '@/components/pages/Quiz/Quiz';

const path = '/_app/$topicId/quiz';

const parseSearch = (search: Record<string, unknown>) =>
  ({
    answerFieldKey: typeof search.answerFieldKey === 'string' ? search.answerFieldKey : '',
    questionCount:
      typeof search.questionCount === 'number'
        ? search.questionCount
        : typeof search.questionCount === 'string'
          ? Number(search.questionCount)
          : 0,
    showCorrectAnswer:
      typeof search.showCorrectAnswer === 'boolean'
        ? search.showCorrectAnswer
        : search.showCorrectAnswer === 'false'
          ? false
          : true,
  }) as const;

const RouteComponent = () => {
  const { items, topic } = useLoaderData({ from: path });
  const { answerFieldKey, questionCount, showCorrectAnswer } = Route.useSearch();

  return (
    <Quiz
      answerFieldKey={answerFieldKey}
      items={items}
      questionCount={questionCount}
      showCorrectAnswer={showCorrectAnswer}
      topic={topic}
    />
  );
};

export const Route = createFileRoute(path)({
  loader: async ({ context: { queryClient }, params }) => {
    const topic = await queryClient.ensureQueryData(topicOptions(params.topicId));
    const items = await queryClient.ensureQueryData(topicItemsOptions(topic.slug));

    return {
      items,
      topic,
      title: topic.label,
      subtitle: 'Kvíz',
    };
  },
  component: RouteComponent,
  validateSearch: parseSearch,
});
