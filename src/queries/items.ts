import { listTopicItems } from '@service/items';

import { QUERY_KEYS } from './queryKeys';

export const topicItemsOptions = (collectionName: string) => ({
  queryKey: QUERY_KEYS.ITEMS.byTopic(collectionName),
  queryFn: () => listTopicItems({ collectionName }),
  staleTime: 1_000,
});
