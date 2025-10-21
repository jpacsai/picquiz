import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Topic } from '../types/topics';

export const listTopics = async (): Promise<ReadonlyArray<Topic>> =>
  getDocs(collection(db, 'topics')).then((snap) =>
    snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Topic, 'id'>) })),
  );
