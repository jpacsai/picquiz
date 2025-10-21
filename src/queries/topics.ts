import { QUERY_KEYS } from './queryKeys';
import { listTopics } from '../data/topics';

export const topicsOptions = () => ({
  queryKey: QUERY_KEYS.TOPICS.list(),
  queryFn: listTopics,
  staleTime: 60_000,
});
