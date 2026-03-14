import { doc, getDoc } from 'firebase/firestore';

import { db } from '../lib/firebase';
import type { Topic, TopicField } from '../types/topics';

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
    return options
      .split(',')
      .map((option: string) => option.trim())
      .filter(Boolean);
  }

  if (!options?.length) {
    return [];
  }

  if (options.length === 1) {
    return options[0]
      .split(',')
      .map((option: string) => option.trim())
      .filter(Boolean);
  }

  return options;
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

export const getTopicById = async (topicId: string) => {
  const snap = await getDoc(doc(db, 'topics', topicId));
  if (!snap.exists()) throw new Error('Not found');
  return normalizeTopic(snap.id, snap.data() as TopicDocument);
};
