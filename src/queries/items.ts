import { getTopicItem, listTopicItems } from '@service/items';

import { QUERY_KEYS } from './queryKeys';

export const topicItemsOptions = (collectionName: string) => ({
  queryKey: QUERY_KEYS.ITEMS.byTopic(collectionName),
  queryFn: () => listTopicItems({ collectionName }),
  staleTime: 1_000,
});

export const topicItemOptions = (collectionName: string, itemId: string) => ({
  queryKey: QUERY_KEYS.ITEMS.detail(collectionName, itemId),
  queryFn: () => getTopicItem({ collectionName, itemId }),
  staleTime: 1_000,
});
