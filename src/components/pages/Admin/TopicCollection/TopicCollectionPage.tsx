import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { topicItemsOptions } from '@queries/items';
import type { TopicItem } from '@service/items';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import AdminTopicItemCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/AdminTopicItemCard';
import EmptyCollectionCard from '@/components/pages/Admin/TopicCollection/TopicItem/components/EmptyCollectionCard';
import type { Topic } from '@/types/topics';

type AdminTopicCollectionPageProps = {
  items: ReadonlyArray<TopicItem>;
  saved?: 'edited';
  topic: Topic;
};

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

const AdminTopicCollectionPage = ({ items, saved, topic }: AdminTopicCollectionPageProps) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: liveItems = items } = useQuery({
    ...topicItemsOptions(topic.slug),
    initialData: items,
  });
  const sortedLiveItems = sortTopicItemsByNewestCreated(liveItems);

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

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => {
            void navigate({
              to: '/admin/$topicId/new',
              params: { topicId: topic.id },
            });
          }}
        >
          Új item feltöltése
        </Button>
      </Box>

      {sortedLiveItems.length ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {sortedLiveItems.map((item) => (
            <AdminTopicItemCard
              collectionName={topic.slug}
              fields={topic.fields}
              item={item}
              key={item.id}
              topicId={topic.id}
            />
          ))}
        </Box>
      ) : (
        <EmptyCollectionCard />
      )}
    </Box>
  );
};

export default AdminTopicCollectionPage;
