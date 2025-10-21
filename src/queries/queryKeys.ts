export const QUERY_KEYS = {
  TOPICS: {
    all: ['topics'] as const,
    list: () => ['topics', 'list'] as const,
    byId: (id: string) => ['topics', 'byId', id] as const,
  },
  ART: {
    all: ['art'] as const,
    list: (topic?: string) => ['art', 'list', topic ?? 'all'] as const,
    detail: (id: string) => ['art', 'detail', id] as const,
  },
  ITEMS: {
    byTopic: (topic: string) => ['items', 'byTopic', topic] as const,
    search: (topic: string, query: string) => ['items', 'search', { topic, query }] as const,
  },
} as const;
