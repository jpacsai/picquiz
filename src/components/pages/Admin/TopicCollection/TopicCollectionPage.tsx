import type { Topic, TopicItem } from '@/types/topics';

import TopicCollectionPageView from './TopicCollectionPageView';
import { useTopicCollectionPage } from './useTopicCollectionPage';

type AdminTopicCollectionPageProps = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

const AdminTopicCollectionPage = ({ items, saved, topic }: AdminTopicCollectionPageProps) => {
  const viewModel = useTopicCollectionPage({ items, saved, topic });

  return <TopicCollectionPageView {...viewModel} />;
};

export default AdminTopicCollectionPage;
