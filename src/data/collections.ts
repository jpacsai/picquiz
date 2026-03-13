import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Topic, TopicField } from '../types/topics';

type LegacyTopicField = Omit<TopicField, 'type'> & {
  type: 'string' | 'number';
  options?: string[];
};

type TopicDocument = Omit<Topic, 'id' | 'fields'> & {
  fields: LegacyTopicField[];
};

const normalizeField = (field: LegacyTopicField): TopicField => {
  if (field.options?.length) {
    return {
      ...field,
      type: 'select',
      options: field.options,
    };
  }

  return field;
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
