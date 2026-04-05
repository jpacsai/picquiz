import type {
  Topic,
  TopicCollectionSearchField,
  TopicCollectionSortField,
  TopicField,
  TopicItem,
} from '@/types/topics';

const getCreatedAtValue = (value: unknown) => {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const toMillis = value.toMillis;

    if (typeof toMillis === 'function') {
      return toMillis.call(value);
    }
  }

  if (value && typeof value === 'object' && 'seconds' in value) {
    const seconds = value.seconds;
    const nanoseconds = 'nanoseconds' in value ? value.nanoseconds : 0;

    if (typeof seconds === 'number') {
      return seconds * 1_000 + (typeof nanoseconds === 'number' ? nanoseconds / 1_000_000 : 0);
    }
  }

  return 0;
};

const getSearchValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim().toLocaleLowerCase();
  }

  if (typeof value === 'number') {
    return String(value).toLocaleLowerCase();
  }

  if (typeof value === 'boolean') {
    return (value ? 'igaz' : 'hamis').toLocaleLowerCase();
  }

  return '';
};

export const sortTopicItemsByNewestCreated = (items: ReadonlyArray<TopicItem>) =>
  [...items].sort(
    (left, right) => getCreatedAtValue(right.created_at) - getCreatedAtValue(left.created_at),
  );

export const getSearchableTopicFields = (fields: ReadonlyArray<TopicField>) =>
  fields.filter(
    (field): field is TopicCollectionSearchField =>
      (field.type === 'string' ||
        field.type === 'number' ||
        field.type === 'year' ||
        field.type === 'yearRange' ||
        field.type === 'select' ||
        field.type === 'boolean') &&
      field.hideInEdit !== true,
  );

export const getSortableTopicFields = (fields: ReadonlyArray<TopicField>) =>
  fields.filter(
    (field): field is TopicCollectionSortField =>
      (field.type === 'string' ||
        field.type === 'number' ||
        field.type === 'year' ||
        field.type === 'select') &&
      field.hideInEdit !== true,
  );

export const getDefaultSortFieldKey = (topic: Topic) => getSortableTopicFields(topic.fields)[0]?.key ?? '';

const getSortableValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim().toLocaleLowerCase();
  }

  if (typeof value === 'number') {
    return value;
  }

  return null;
};

export const sortTopicItems = ({
  direction,
  fieldKey,
  items,
}: {
  direction: 'asc' | 'desc';
  fieldKey: string;
  items: ReadonlyArray<TopicItem>;
}) => {
  if (fieldKey === 'created_at') {
    const sortedItems = sortTopicItemsByNewestCreated(items);

    return direction === 'desc' ? sortedItems : [...sortedItems].reverse();
  }

  return [...items].sort((left, right) => {
    const leftValue = getSortableValue(left[fieldKey]);
    const rightValue = getSortableValue(right[fieldKey]);

    if (leftValue === null && rightValue === null) {
      return 0;
    }

    if (leftValue === null) {
      return 1;
    }

    if (rightValue === null) {
      return -1;
    }

    const comparison =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), 'hu');

    return direction === 'asc' ? comparison : comparison * -1;
  });
};

export const getDefaultSearchFieldKey = (topic: Topic) =>
  getSearchableTopicFields(topic.fields)[0]?.key ?? '';

export const filterTopicItems = ({
  fieldType,
  fieldKey,
  items,
  query,
}: {
  fieldType?: TopicCollectionSearchField['type'];
  fieldKey: string;
  items: ReadonlyArray<TopicItem>;
  query: string;
}) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery || !fieldKey) {
    return items;
  }

  return items.filter((item) => {
    const value = item[fieldKey];

    if (fieldType === 'boolean' && normalizedQuery === 'hamis' && typeof value === 'undefined') {
      return true;
    }

    return getSearchValue(value).includes(normalizedQuery);
  });
};
