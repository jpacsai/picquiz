import type { Topic, TopicCollectionSearchField, TopicField, TopicItem } from '@/types/topics';

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
      field.quiz?.enabled === true &&
      field.hideInEdit !== true,
  );

export const getDefaultSearchFieldKey = (topic: Topic) =>
  getSearchableTopicFields(topic.fields)[0]?.key ?? '';

export const filterTopicItems = ({
  fieldKey,
  items,
  query,
}: {
  fieldKey: string;
  items: ReadonlyArray<TopicItem>;
  query: string;
}) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery || !fieldKey) {
    return items;
  }

  return items.filter((item) => getSearchValue(item[fieldKey]).includes(normalizedQuery));
};
