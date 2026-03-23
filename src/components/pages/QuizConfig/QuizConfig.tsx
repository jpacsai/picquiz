import { useQuizConfig } from '@/components/pages/QuizConfig/useQuizConfig';
import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import QuizConfigView from './QuizConfigView';

type QuizConfigProps = {
  items: ReadonlyArray<TopicItem>;
  topic: Topic;
};

const QuizConfig = ({ items, topic }: QuizConfigProps) => {
  const viewModel = useQuizConfig({ items, topic });

  return <QuizConfigView {...viewModel} />;
};

export default QuizConfig;
