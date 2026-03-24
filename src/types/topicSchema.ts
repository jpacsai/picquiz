import type { QuizFieldConfig, TopicField, TopicFieldFn } from '@/types/topics';

type TopicFieldDraftBase = {
  autocomplete?: boolean;
  display?: TopicField['display'];
  hideInEdit?: boolean;
  key?: string;
  label?: string;
  quiz?: QuizFieldConfig;
  readonly?: boolean;
  required?: boolean;
  fn?: TopicFieldFn;
  type?: TopicField['type'];
};

export type TopicFieldDraft = TopicFieldDraftBase & {
  fileNameFields?: Partial<Extract<TopicField, { type: 'imageUpload' }>['fileNameFields']>;
  options?: string[];
  targetFields?: Partial<Extract<TopicField, { type: 'imageUpload' }>['targetFields']>;
};

export type TopicDraft = {
  fields: TopicFieldDraft[];
  id?: string;
  label?: string;
  slug?: string;
  storage_prefix?: string;
};

export type TopicSchemaIssue = {
  message: string;
  path: string;
  severity: 'error' | 'warning';
};

export type TopicSchemaValidationResult = {
  errors: TopicSchemaIssue[];
  warnings: TopicSchemaIssue[];
};
