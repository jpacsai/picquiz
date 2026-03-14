import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Topic, TopicField } from '../types/topics';

type LegacyTopicField = Omit<TopicField, 'type'> & {
  type: 'string' | 'number' | 'select';
  options?: string[] | string;
};

type TopicDocument = Omit<Topic, 'id' | 'fields'> & {
  fields: LegacyTopicField[];
};

const normalizeOptions = (options: LegacyTopicField['options']): string[] => {
  if (typeof options === 'string') {
    return options
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);
  }

  if (!options?.length) {
    return [];
  }

  if (options.length === 1) {
    return options[0]
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);
  }

  return options;
};

const normalizeField = (field: LegacyTopicField): TopicField => {
  const normalizedOptions = normalizeOptions(field.options);

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
