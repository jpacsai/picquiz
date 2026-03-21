import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

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

export const getTopicItem = async ({
  collectionName,
  itemId,
}: {
  collectionName: string;
  itemId: string;
}): Promise<TopicItem> => {
  const snap = await getDoc(doc(db, collectionName, itemId));

  if (!snap.exists()) {
    throw new Error('Not found');
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const updateTopicItem = async ({
  collectionName,
  itemId,
  values,
}: {
  collectionName: string;
  itemId: string;
  values: TopicItemValues;
}) => {
  return updateDoc(doc(db, collectionName, itemId), {
    ...values,
    updated_at: serverTimestamp(),
  });
};

export const deleteTopicItem = async ({
  collectionName,
  itemId,
}: {
  collectionName: string;
  itemId: string;
}) => {
  return deleteDoc(doc(db, collectionName, itemId));
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
