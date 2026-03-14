import { getTopicById } from '../data/collections';
import { listTopics } from '../data/topics';
import { QUERY_KEYS } from './queryKeys';

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
