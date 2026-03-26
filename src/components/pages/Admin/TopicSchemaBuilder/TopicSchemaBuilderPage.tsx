import type { TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import { TopicSchemaBuilderProvider } from './context/TopicSchemaBuilderContext';
import TopicSchemaBuilderPageView from './TopicSchemaBuilderPageView';

const TopicSchemaBuilderPage = ({ mode, sourceTopic, topic }: TopicSchemaBuilderPageProps) => {
  return (
    <TopicSchemaBuilderProvider mode={mode} sourceTopic={sourceTopic} topic={topic}>
      <TopicSchemaBuilderPageView />
    </TopicSchemaBuilderProvider>
  );
};

export default TopicSchemaBuilderPage;
