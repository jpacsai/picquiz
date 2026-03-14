export type TopicFieldFn = {
  source: string;
  name: string;
};

type BaseTopicField = {
  key: string;
  label: string;
  required?: boolean;
  readonly?: boolean;
  fn?: TopicFieldFn;
  hideInEdit?: boolean;
};

export type TopicField =
  | (BaseTopicField & {
      type: 'string';
    })
  | (BaseTopicField & {
      type: 'number';
    })
  | (BaseTopicField & {
      type: 'select';
      options: string[];
    });

export type Topic = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: TopicField[];
};
