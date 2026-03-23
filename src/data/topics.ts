import { collection, getDocs } from 'firebase/firestore';

import { db } from '../lib/firebase';
import type { Topic, TopicField } from '../types/topics';
import { sortSelectOptions } from '../utils/sortSelectOptions';

type LegacyTopicField =
  | Extract<TopicField, { type: 'string' | 'number' | 'imageUpload' }>
  | {
      key: string;
      label: string;
      required?: boolean;
      readonly?: boolean;
      fn?: TopicField['fn'];
      hideInEdit?: boolean;
      type: 'string' | 'number' | 'select';
      options?: string[] | string;
    };

type TopicDocument = Omit<Topic, 'id' | 'fields'> & {
  fields: LegacyTopicField[];
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

const normalizeField = (field: LegacyTopicField): TopicField => {
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

const normalizeTopic = (id: string, data: TopicDocument): Topic => ({
  ...data,
  id,
  fields: data.fields.map(normalizeField),
});

export const listTopics = async (): Promise<ReadonlyArray<Topic>> =>
  getDocs(collection(db, 'topics')).then((snap) =>
    snap.docs.map((d) => normalizeTopic(d.id, d.data() as TopicDocument)),
  );
