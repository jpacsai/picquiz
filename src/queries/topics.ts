import { QUERY_KEYS } from './queryKeys';
import { listTopics } from '../data/topics';
import { getTopicById } from '../data/collections';

export const topicsOptions = () => ({
  queryKey: QUERY_KEYS.TOPICS.list(),
  queryFn: listTopics,
  staleTime: 60_000,
});

export const topicOptions = (topicId: string) => ({
  queryKey: QUERY_KEYS.TOPICS.byId(topicId),
  queryFn: () => getTopicById(topicId),
  staleTime: 1000,
});
