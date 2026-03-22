import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import Quiz from '@/components/pages/Quiz/Quiz';

const path = '/_app/$topicId/quiz';

const parseSearch = (search: Record<string, unknown>) =>
  ({
    answerFieldKeys: Array.isArray(search.answerFieldKeys)
      ? search.answerFieldKeys.filter(
          (fieldKey): fieldKey is string =>
            typeof fieldKey === 'string' && fieldKey.trim().length > 0,
        )
      : typeof search.answerFieldKeys === 'string'
        ? search.answerFieldKeys
            .split(',')
            .map((fieldKey) => fieldKey.trim())
            .filter(Boolean)
        : [],
    autoAdvanceAfterAnswer:
      typeof search.autoAdvanceAfterAnswer === 'boolean'
        ? search.autoAdvanceAfterAnswer
        : search.autoAdvanceAfterAnswer === 'true',
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
  const { answerFieldKeys, autoAdvanceAfterAnswer, questionCount, showCorrectAnswer } =
    Route.useSearch();

  return (
    <Quiz
      answerFieldKeys={answerFieldKeys}
      autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
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
    };
  },
  component: RouteComponent,
  validateSearch: parseSearch,
});
