import { Box, CircularProgress } from '@mui/material';

import AdminTopicItemCard from '@/components/pages/Admin/TopicCollection/components/AdminTopicItemCard';
import EmptyCollectionCard from '@/components/pages/Admin/TopicCollection/components/EmptyCollectionCard';
import TopicCollectionNoResults from '@/components/pages/Admin/TopicCollection/components/TopicCollectionNoResults';
import type { Topic, TopicItem } from '@/types/topics';

type TopicItemSectionProps = {
  isLoading: boolean;
  noResultsQuery?: string;
  items: readonly TopicItem[];
  topic: Topic;
};

const TopicItemSection = ({ isLoading, noResultsQuery, items, topic }: TopicItemSectionProps) => {
  const content = !items.length && noResultsQuery ? (
    <TopicCollectionNoResults query={noResultsQuery} />
  ) : !items.length ? (
    <EmptyCollectionCard />
  ) : (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <AdminTopicItemCard
          collectionName={topic.slug}
          fields={topic.fields}
          item={item}
          key={item.id}
          topicId={topic.id}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {content}

      {isLoading ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.56)' : 'rgba(255, 255, 255, 0.5)',
            borderRadius: 1,
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            position: 'absolute',
            zIndex: 1,
          }}
        >
          <CircularProgress aria-label="Szűrés és rendezés folyamatban" color="primary" size={56} />
        </Box>
      ) : null}
    </Box>
  );
};

export default TopicItemSection;
