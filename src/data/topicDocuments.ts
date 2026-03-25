import type { Topic, TopicField } from '@/types/topics';
import { sortSelectOptions } from '@/utils/sortSelectOptions';

export type LegacyTopicField =
  | Extract<TopicField, { type: 'string' | 'number' | 'year' | 'yearRange' | 'boolean' | 'imageUpload' }>
  | {
      key: string;
      label: string;
      required?: boolean;
      readonly?: boolean;
      fn?: TopicField['fn'];
      hideInEdit?: boolean;
      type: 'string' | 'number' | 'year' | 'yearRange' | 'boolean' | 'select';
      options?: string[] | string;
    };

export type TopicDocument = Omit<Topic, 'id' | 'fields'> & {
  fields: LegacyTopicField[];
};

const removeUndefinedDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedDeep(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([entryKey, entryValue]) => [entryKey, removeUndefinedDeep(entryValue)]),
    ) as T;
  }

  return value;
};

const normalizeOptions = (options: string[] | string | undefined): string[] => {
  if (typeof options === 'string') {
    return sortSelectOptions(
      options
        .split(',')
        .map((option: string) => option.trim())
        .filter(Boolean),
    );
  }

  if (!options?.length) {
    return [];
  }

  if (options.length === 1) {
    return sortSelectOptions(
      options[0]
        .split(',')
        .map((option: string) => option.trim())
        .filter(Boolean),
    );
  }

  return sortSelectOptions(options);
};

export const normalizeTopicField = (field: LegacyTopicField): TopicField => {
  if (field.type === 'imageUpload') {
    return field;
  }

  const normalizedOptions = normalizeOptions('options' in field ? field.options : undefined);

  if (field.type === 'select' || normalizedOptions.length) {
    return {
      ...field,
      type: 'select',
      options: normalizedOptions,
    };
  }

  return {
    ...field,
    type: field.type,
  };
};

export const normalizeTopicDocument = (id: string, data: TopicDocument): Topic => ({
  ...data,
  id,
  fields: data.fields.map(normalizeTopicField),
});

export const serializeTopicDocument = (
  topic: Pick<Topic, 'label' | 'slug' | 'storage_prefix' | 'fields'>,
): TopicDocument => ({
  label: topic.label,
  slug: topic.slug,
  storage_prefix: topic.storage_prefix,
  fields: topic.fields.map((field) =>
    removeUndefinedDeep(
      field.type === 'select'
        ? {
            ...field,
            options: sortSelectOptions(field.options),
          }
        : field,
    ),
  ),
});
