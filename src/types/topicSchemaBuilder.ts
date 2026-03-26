import type { Topic } from '@/types/topics';

export type TopicSchemaBuilderMode = 'create' | 'edit';

export type TopicSchemaBuilderPageProps = {
  mode: TopicSchemaBuilderMode;
  sourceTopic?: Topic;
  topic?: Topic;
};

export type SelectedFieldIndex = number | 'fixed-image-upload' | null;
