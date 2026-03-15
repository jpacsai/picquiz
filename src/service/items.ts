import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '../lib/firebase';

export type TopicItemValues = Record<string, string | number>;

export const createTopicItem = async ({
  collectionName,
  values,
}: {
  collectionName: string;
  values: TopicItemValues;
}) => {
  return addDoc(collection(db, collectionName), {
    ...values,
    created_at: serverTimestamp(),
  });
};
