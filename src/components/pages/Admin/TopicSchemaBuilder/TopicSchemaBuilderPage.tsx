import type { TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import { TopicSchemaBuilderProvider } from './context/TopicSchemaBuilderContext';
import TopicSchemaBuilderPageView from './TopicSchemaBuilderPageView';

const TopicSchemaBuilderPage = ({ mode, topic }: TopicSchemaBuilderPageProps) => {
  return (
    <TopicSchemaBuilderProvider mode={mode} topic={topic}>
      <TopicSchemaBuilderPageView />
    </TopicSchemaBuilderProvider>
  );
};

export default TopicSchemaBuilderPage;
