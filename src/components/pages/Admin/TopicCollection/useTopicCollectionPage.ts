import { topicItemsOptions } from '@queries/items';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

import {
  filterTopicItems,
  getDefaultSearchFieldKey,
  getSearchableTopicFields,
  getSortableTopicFields,
  sortTopicItems,
} from '@/components/pages/Admin/TopicCollection/utils';
import {
  ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE,
  ADMIN_TOPIC_COLLECTION_SEARCH_DEBOUNCE_MS,
  ADMIN_TOPIC_COLLECTION_STORAGE_KEYS,
} from '@/consts/admin';
import type { Topic, TopicCollectionSearchField, TopicCollectionSortField, TopicItem } from '@/types/topics';
import { getStoredString } from '@/utils/storage';

type UseTopicCollectionPageParams = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

export const useTopicCollectionPage = ({ items, saved, topic }: UseTopicCollectionPageParams) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: liveItems = items } = useQuery({
    ...topicItemsOptions(topic.slug),
    initialData: items,
  });
  const searchableFields = useMemo(() => getSearchableTopicFields(topic.fields), [topic.fields]);
  const sortableFields = useMemo(() => getSortableTopicFields(topic.fields), [topic.fields]);
  const defaultSearchFieldKey = useMemo(() => getDefaultSearchFieldKey(topic), [topic]);
  const searchFieldStorageKey: string = ADMIN_TOPIC_COLLECTION_STORAGE_KEYS.searchFieldKey(
    topic.id,
  );
  const searchQueryStorageKey: string = ADMIN_TOPIC_COLLECTION_STORAGE_KEYS.searchQuery(topic.id);
  const sortDirectionStorageKey: string = ADMIN_TOPIC_COLLECTION_STORAGE_KEYS.sortDirection(topic.id);
  const sortFieldStorageKey: string = ADMIN_TOPIC_COLLECTION_STORAGE_KEYS.sortFieldKey(topic.id);
  const [searchFieldKey, setSearchFieldKey] = useState<string>(() =>
    getStoredString(searchFieldStorageKey),
  );
  const [searchQuery, setSearchQuery] = useState<string>(() =>
    getStoredString(searchQueryStorageKey),
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() =>
    getStoredString(sortDirectionStorageKey) === 'asc' ? 'asc' : 'desc',
  );
  const [sortFieldKey, setSortFieldKey] = useState<string>(() => getStoredString(sortFieldStorageKey));
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const activeSearchFieldKey = searchableFields.some((field) => field.key === searchFieldKey)
    ? searchFieldKey
    : defaultSearchFieldKey;
  const activeSearchField = searchableFields.find((field) => field.key === activeSearchFieldKey);
  const activeSortFieldKey =
    sortFieldKey === 'created_at' || sortableFields.some((field) => field.key === sortFieldKey)
      ? sortFieldKey
      : 'created_at';
  const searchOptions = useMemo(
    () =>
      [
        ...new Set(
          liveItems
            .map((item) => item[activeSearchFieldKey])
            .filter(
              (value): value is string | number =>
                typeof value === 'string' || typeof value === 'number',
            )
            .map((value) => String(value).trim())
            .filter(Boolean),
        ),
      ].sort((left, right) => left.localeCompare(right, 'hu')),
    [activeSearchFieldKey, liveItems],
  );

  useEffect(() => {
    const timeoutId: ReturnType<typeof window.setTimeout> = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, ADMIN_TOPIC_COLLECTION_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    window.localStorage.setItem(searchFieldStorageKey, activeSearchFieldKey);
  }, [activeSearchFieldKey, searchFieldStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(searchQueryStorageKey, searchQuery);
  }, [searchQuery, searchQueryStorageKey]);
  useEffect(() => {
    window.localStorage.setItem(sortDirectionStorageKey, sortDirection);
  }, [sortDirection, sortDirectionStorageKey]);
  useEffect(() => {
    window.localStorage.setItem(sortFieldStorageKey, activeSortFieldKey);
  }, [activeSortFieldKey, sortFieldStorageKey]);

  const filteredItems = useMemo(
    () =>
      filterTopicItems({
        fieldType: activeSearchField?.type,
        fieldKey: activeSearchFieldKey,
        items: liveItems,
        query: debouncedSearchQuery,
      }),
    [activeSearchField?.type, activeSearchFieldKey, debouncedSearchQuery, liveItems],
  );
  const sortedItems = useMemo(
    () =>
      sortTopicItems({
        direction: sortDirection,
        fieldKey: activeSortFieldKey,
        items: filteredItems,
      }),
    [activeSortFieldKey, filteredItems, sortDirection],
  );
  const pageCount = Math.ceil(sortedItems.length / ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE;

    return sortedItems.slice(startIndex, startIndex + ADMIN_TOPIC_COLLECTION_ITEMS_PER_PAGE);
  }, [currentPage, sortedItems]);

  useEffect(() => {
    if (saved !== 'edited') {
      return;
    }

    enqueueSnackbar('Az elem módosításai elmentve.', {
      key: 'admin-topic-item-edited',
      preventDuplicate: true,
      variant: 'success',
    });

    void navigate({
      replace: true,
      search: { saved: undefined },
      to: '/$topicId/items',
      params: { topicId: topic.id },
    });
  }, [enqueueSnackbar, navigate, saved, topic.id]);

  return {
    currentPage,
    items: paginatedItems,
    noResultsQuery:
      liveItems.length > 0 && sortedItems.length === 0 ? debouncedSearchQuery.trim() : undefined,
    onCreateNewItem: () => {
      void navigate({
        to: '/$topicId/items/new',
        params: { topicId: topic.id },
      });
    },
    onPageChange: (nextPage: number) => {
      setPage(nextPage);
    },
    onSearchFieldChange: (newValue: string) => {
      setPage(1);
      setSearchFieldKey(newValue);
      setSearchQuery('');
    },
    onSearchQueryChange: (nextSearchQuery: string) => {
      setPage(1);
      setSearchQuery(nextSearchQuery);
    },
    onSortDirectionChange: (nextDirection: 'asc' | 'desc') => {
      setPage(1);
      setSortDirection(nextDirection);
    },
    onSortFieldChange: (nextFieldKey: string) => {
      setPage(1);
      setSortFieldKey(nextFieldKey);
    },
    onResetSearch: () => {
      setPage(1);
      setSearchFieldKey(defaultSearchFieldKey);
      setSearchQuery('');
      setSortDirection('desc');
      setSortFieldKey('created_at');
      setDebouncedSearchQuery('');
    },
    pageCount,
    searchFieldKey: activeSearchFieldKey,
    searchOptions,
    searchQuery,
    searchableFields,
    sortDirection,
    sortFieldKey: activeSortFieldKey,
    sortableFields,
    visibleItemCount: sortedItems.length,
    totalItemCount: liveItems.length,
    topic,
  };
};

export type UseTopicCollectionPageResult = ReturnType<typeof useTopicCollectionPage>;
export type TopicCollectionPageSearchField = TopicCollectionSearchField;
export type TopicCollectionPageSortField = TopicCollectionSortField;
