import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Topic } from '../types/topics';

export const getTopicById = async (topicId: string) => {
  const snap = await getDoc(doc(db, 'topics', topicId));
  if (!snap.exists()) throw new Error('Not found');
  return { ...(snap.data() as Topic), id: snap.id };
};
