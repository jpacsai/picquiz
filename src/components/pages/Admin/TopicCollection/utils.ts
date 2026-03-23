import type { TopicItem } from "@/types/topics";

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


export const sortTopicItemsByNewestCreated = (items: ReadonlyArray<TopicItem>) =>
  [...items].sort(
    (left, right) => getCreatedAtValue(right.created_at) - getCreatedAtValue(left.created_at),
  );