export const ADMIN_TOPIC_COLLECTION_SEARCH_DEBOUNCE_MS = 1000;
export const ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE = 24;

export const ADMIN_TOPIC_COLLECTION_STORAGE_KEYS = {
  searchFieldKey: (topicId: string) => `picquiz-admin-topic-collection-search-field-${topicId}`,
  searchQuery: (topicId: string) => `picquiz-admin-topic-collection-search-query-${topicId}`,
} as const;
