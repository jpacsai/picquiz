import { Box, Stack } from '@mui/material';

import ItemTopicPageCard from '@/components/pages/Admin/TopicPage/components/ItemTopicPageCard';
import SchemaTopicPageCard from '@/components/pages/Admin/TopicPage/components/SchemaTopicPageCard';
import type { Topic } from '@/types/topics';

type AdminTopicPageProps = {
  itemCount: number;
  topic: Topic;
};

const AdminTopicPage = ({ itemCount, topic }: AdminTopicPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3, maxWidth: 900 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <ItemTopicPageCard itemCount={itemCount} topicId={topic.id} />

        <SchemaTopicPageCard topicId={topic.id} />
      </Stack>
    </Box>
  );
};

export default AdminTopicPage;
