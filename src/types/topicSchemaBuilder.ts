import type { Topic } from '@/types/topics';

export type TopicSchemaBuilderMode = 'create' | 'edit';

export type TopicSchemaBuilderPageProps = {
  mode: TopicSchemaBuilderMode;
  topic?: Topic;
};

export type SelectedFieldIndex = number | 'fixed-image-upload' | null;
