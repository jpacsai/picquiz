import { doc, getDoc } from 'firebase/firestore';

import { db } from '../lib/firebase';
import { normalizeTopicDocument, type TopicDocument } from './topicDocuments';

export const getTopicById = async (topicId: string) => {
  const snap = await getDoc(doc(db, 'topics', topicId));
  if (!snap.exists()) throw new Error('Not found');
  return normalizeTopicDocument(snap.id, snap.data() as TopicDocument);
};
