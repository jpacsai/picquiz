import { topicItemsOptions } from '@queries/items';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

import {
  filterTopicItems,
  getDefaultSearchFieldKey,
  getSearchableTopicFields,
  sortTopicItemsByNewestCreated,
} from '@/components/pages/Admin/TopicCollection/utils';
import { ADMIN_TOPIC_COLLECTION_SEARCH_DEBOUNCE_MS } from '@/consts/admin';
import type { Topic, TopicCollectionSearchField, TopicItem } from '@/types/topics';

type UseTopicCollectionPageParams = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

export const useTopicCollectionPage = ({
  items,
  saved,
  topic,
}: UseTopicCollectionPageParams) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: liveItems = items } = useQuery({
    ...topicItemsOptions(topic.slug),
    initialData: items,
  });
  const searchableFields = useMemo(() => getSearchableTopicFields(topic.fields), [topic.fields]);
  const defaultSearchFieldKey = useMemo(() => getDefaultSearchFieldKey(topic), [topic]);
  const [searchFieldKey, setSearchFieldKey] = useState(defaultSearchFieldKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const activeSearchFieldKey = searchableFields.some((field) => field.key === searchFieldKey)
    ? searchFieldKey
    : defaultSearchFieldKey;
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

  const filteredItems = useMemo(
    () =>
      filterTopicItems({
        fieldKey: activeSearchFieldKey,
        items: liveItems,
        query: debouncedSearchQuery,
      }),
    [activeSearchFieldKey, debouncedSearchQuery, liveItems],
  );
  const sortedItems = useMemo(() => sortTopicItemsByNewestCreated(filteredItems), [filteredItems]);

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
      to: '/admin/$topicId',
      params: { topicId: topic.id },
    });
  }, [enqueueSnackbar, navigate, saved, topic.id]);

  return {
    items: sortedItems,
    noResultsQuery:
      liveItems.length > 0 && sortedItems.length === 0 ? debouncedSearchQuery.trim() : undefined,
    onCreateNewItem: () => {
      void navigate({
        to: '/admin/$topicId/new',
        params: { topicId: topic.id },
      });
    },
    onSearchFieldChange: (newValue: string) => {
      setSearchFieldKey(newValue);
      setSearchQuery('');
    },
    onSearchQueryChange: setSearchQuery,
    searchFieldKey: activeSearchFieldKey,
    searchOptions,
    searchQuery,
    searchableFields,
    topic,
  };
};

export type UseTopicCollectionPageResult = ReturnType<typeof useTopicCollectionPage>;
export type TopicCollectionPageSearchField = TopicCollectionSearchField;
