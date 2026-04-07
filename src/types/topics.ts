export type TopicFieldFn = {
  source: string;
  name: string;
};

export type QuizDistractorConfig =
  | {
      type: 'fromOptions';
    }
  | {
      type: 'booleanPair';
    }
  | {
      type: 'numericRange';
      minValue?: number;
      minOffset?: number;
      maxOffset?: number;
      maxValue: number | 'todayYear';
    }
  | {
      type: 'derivedRange';
      sourceField: string;
      deriveWith: 'yearToCentury';
      minValue?: number;
      minOffset?: number;
      maxOffset?: number;
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

export type FilterFieldConfig = {
  enabled: boolean;
};

type BaseTopicField = {
  autocomplete?: boolean;
  key: string;
  label: string;
  display?: 'title' | 'subtitle' | 'meta';
  required?: boolean;
  readonly?: boolean;
  fn?: TopicFieldFn;
  filter?: FilterFieldConfig;
  hideInEdit?: boolean;
  quiz?: QuizFieldConfig;
};

export type TopicField =
  | (BaseTopicField & {
      autocompleteCopyFields?: string[];
      autocompleteMatchField?: string;
      type: 'string';
    })
  | (BaseTopicField & {
      type: 'number';
    })
  | (BaseTopicField & {
      type: 'year';
      min?: number;
      max?: number | 'todayYear';
    })
  | (BaseTopicField & {
      type: 'yearRange';
      min?: number;
      max?: number | 'todayYear';
    })
  | (BaseTopicField & {
      type: 'boolean';
    })
  | (BaseTopicField & {
      type: 'select';
      options: string[];
    })
  | (BaseTopicField & {
      type: 'imageUpload';
      fileNameFields: string[];
      targetFields: {
        desktop: string;
        mobile: string;
        desktopPath?: string;
        mobilePath?: string;
      };
      label: string;
      buttonLabel?: string;
    });

export type TopicCollectionSearchField = Extract<
  TopicField,
  { type: 'string' | 'number' | 'year' | 'yearRange' | 'select' | 'boolean' }
> & {
  hideInEdit?: false;
};

export type TopicCollectionSortField = Extract<
  TopicField,
  { type: 'string' | 'number' | 'year' | 'select' }
> & {
  hideInEdit?: false;
};

export type Topic = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: TopicField[];
};

export type TopicItemValues = Record<string, string | number | boolean>;

export type TopicItem = {
  id: string;
} & Record<string, unknown>;
