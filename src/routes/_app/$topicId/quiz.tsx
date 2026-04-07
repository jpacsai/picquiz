import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import Quiz from '@/components/pages/Quiz/Quiz';
import { filterQuizItems } from '@/utils/quiz';

const path = '/_app/$topicId/quiz';

const parseSearch = (search: Record<string, unknown>) =>
  ({
    answerDetailFieldKeys: Array.isArray(search.answerDetailFieldKeys)
      ? search.answerDetailFieldKeys.filter(
          (fieldKey): fieldKey is string =>
            typeof fieldKey === 'string' && fieldKey.trim().length > 0,
        )
      : typeof search.answerDetailFieldKeys === 'string'
        ? search.answerDetailFieldKeys
            .split(',')
            .map((fieldKey) => fieldKey.trim())
            .filter(Boolean)
        : [],
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
    itemFilterFieldKey:
      typeof search.itemFilterFieldKey === 'string' ? search.itemFilterFieldKey.trim() : '',
    itemFilterValue:
      typeof search.itemFilterValue === 'string' ? search.itemFilterValue.trim() : '',
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
  const {
    answerDetailFieldKeys,
    answerFieldKeys,
    autoAdvanceAfterAnswer,
    itemFilterFieldKey,
    itemFilterValue,
    questionCount,
    showCorrectAnswer,
  } =
    Route.useSearch();
  const filteredItems = filterQuizItems({
    fieldKey: itemFilterFieldKey,
    filterValue: itemFilterValue,
    items,
    topic,
  });

  return (
    <Quiz
      answerDetailFieldKeys={answerDetailFieldKeys}
      answerFieldKeys={answerFieldKeys}
      autoAdvanceAfterAnswer={autoAdvanceAfterAnswer}
      items={filteredItems}
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
