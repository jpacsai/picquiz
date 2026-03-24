import type { TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import { useTopicSchemaBuilder } from './hook/useTopicSchemaBuilder';
import TopicSchemaBuilderPageView from './TopicSchemaBuilderPageView';

const TopicSchemaBuilderPage = ({ mode, topic }: TopicSchemaBuilderPageProps) => {
  const builder = useTopicSchemaBuilder({ mode, topic });

  return <TopicSchemaBuilderPageView builder={builder} mode={mode} />;
};

export default TopicSchemaBuilderPage;
