import type { Topic, TopicItem } from '@/types/topics';

import TopicItemPageView from './TopicItemPageView';
import { useTopicItemPage } from './useTopicItemPage';

type TopicItemPageProps = {
  item: TopicItem;
  topic: Topic;
};

const TopicItemPage = ({ item, topic }: TopicItemPageProps) => {
  const viewModel = useTopicItemPage({ item, topic });

  return <TopicItemPageView {...viewModel} />;
};

export default TopicItemPage;
