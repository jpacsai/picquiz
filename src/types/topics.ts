export type TopicFieldFn = {
  source: string;
  name: string;
};

type BaseTopicField = {
  key: string;
  label: string;
  display?: 'title' | 'subtitle' | 'meta';
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
    })
  | (BaseTopicField & {
      type: 'imageUpload';
      fileNameFields: {
        artist: string;
        title: string;
      };
      targetFields: {
        desktop: string;
        mobile: string;
        desktopPath?: string;
        mobilePath?: string;
      };
      label: string;
      buttonLabel?: string;
    });

export type Topic = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: TopicField[];
};
