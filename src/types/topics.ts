export type TopicFieldFn = {
  source: string;
  name: string;
};

export type QuizDistractorConfig =
  | {
      type: 'fromOptions';
    }
  | {
      type: 'numericRange';
      minValue?: number;
      minOffset?: number;
      maxValue: number | 'todayYear';
    }
  | {
      type: 'derivedRange';
      sourceField: string;
      deriveWith: 'yearToCentury';
      minValue?: number;
      minOffset?: number;
      maxValue: number | 'todayYear';
    };

export type QuizFieldConfig =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      prompt: string;
      distractor?: QuizDistractorConfig;
    };

type BaseTopicField = {
  autocomplete?: boolean;
  key: string;
  label: string;
  display?: 'title' | 'subtitle' | 'meta';
  required?: boolean;
  readonly?: boolean;
  fn?: TopicFieldFn;
  hideInEdit?: boolean;
  quiz?: QuizFieldConfig;
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

export type TopicItemValues = Record<string, string | number>;

export type TopicItem = {
  id: string;
} & Record<string, unknown>;
