import { collection, getDocs } from 'firebase/firestore';

import { db } from '../lib/firebase';
import type { Topic } from '../types/topics';

import { normalizeTopicDocument, type TopicDocument } from './topicDocuments';

export const listTopics = async (): Promise<ReadonlyArray<Topic>> =>
  getDocs(collection(db, 'topics')).then((snap) =>
    snap.docs.map((d) => normalizeTopicDocument(d.id, d.data() as TopicDocument)),
  );
