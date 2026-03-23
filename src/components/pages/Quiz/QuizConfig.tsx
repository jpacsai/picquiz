import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import QuizConfigView from './QuizConfigView';
import { useQuizConfig } from './useQuizConfig';

type QuizConfigProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const QuizConfig = ({ items, topic }: QuizConfigProps) => {
  const viewModel = useQuizConfig({ items, topic });

  return <QuizConfigView {...viewModel} />;
};

export default QuizConfig;
