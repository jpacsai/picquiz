import { collection, getDocs } from 'firebase/firestore';
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

export const listTopics = async (): Promise<ReadonlyArray<Topic>> =>
  getDocs(collection(db, 'topics')).then((snap) =>
    snap.docs.map((d) => normalizeTopic(d.id, d.data() as TopicDocument)),
  );
