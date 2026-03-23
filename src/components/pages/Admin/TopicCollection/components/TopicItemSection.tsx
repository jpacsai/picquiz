import { Box } from '@mui/material';

import AdminTopicItemCard from '@/components/pages/Admin/TopicCollection/components/AdminTopicItemCard';
import EmptyCollectionCard from '@/components/pages/Admin/TopicCollection/components/EmptyCollectionCard';
import TopicCollectionNoResults from '@/components/pages/Admin/TopicCollection/components/TopicCollectionNoResults';
import type { Topic, TopicItem } from '@/types/topics';

type TopicItemSectionProps = {
  noResultsQuery?: string;
  items: readonly TopicItem[];
  topic: Topic;
};

const TopicItemSection = ({ noResultsQuery, items, topic }: TopicItemSectionProps) => {
  if (!items.length && noResultsQuery) {
    return <TopicCollectionNoResults query={noResultsQuery} />;
  }

  if (!items.length) {
    return <EmptyCollectionCard />;
  }

  return (
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
};

export default TopicItemSection;
