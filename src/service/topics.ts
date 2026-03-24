import { doc, setDoc, updateDoc } from 'firebase/firestore';

import type { Topic } from '@/types/topics';

import { serializeTopicDocument } from '../data/topicDocuments';
import { db } from '../lib/firebase';

type PersistedTopicValues = Pick<Topic, 'label' | 'slug' | 'storage_prefix' | 'fields'>;

export const createTopic = async ({
  topicId,
  values,
}: {
  topicId: string;
  values: PersistedTopicValues;
}) =>
  setDoc(doc(db, 'topics', topicId), serializeTopicDocument(values));

export const updateTopic = async ({
  topicId,
  values,
}: {
  topicId: string;
  values: PersistedTopicValues;
}) =>
  updateDoc(doc(db, 'topics', topicId), serializeTopicDocument(values));
