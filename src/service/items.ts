import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

import { db } from '../lib/firebase';

export type TopicItemValues = Record<string, string | number>;
export type TopicItem = {
  id: string;
} & Record<string, unknown>;

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

export const listTopicItems = async ({
  collectionName,
}: {
  collectionName: string;
}): Promise<ReadonlyArray<TopicItem>> => {
  const snap = await getDocs(collection(db, collectionName));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
