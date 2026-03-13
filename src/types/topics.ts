export type TopicFieldFn = {
  source: string;
  name: string;
};

export type TopicField = {
  key: string;
  label: string;
  type: 'string' | 'number';
  required?: boolean;
  readonly?: boolean;
  options?: string[];
  fn?: TopicFieldFn;
};

export type Topic = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: TopicField[];
};
