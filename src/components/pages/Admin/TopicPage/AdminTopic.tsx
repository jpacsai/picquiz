import { Box } from '@mui/material';

import Form from '@/components/pages/Admin/TopicPage/Form/Form';
import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

type AdminTopicProps = {
  initialValues?: Record<string, unknown>;
  item?: TopicItem;
  mode?: 'create' | 'edit';
  topic: Topic;
};

const AdminTopic = ({ initialValues, item, mode = 'create', topic }: AdminTopicProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Form
        collectionName={topic.slug}
        fields={topic.fields}
        initialValues={initialValues}
        itemId={item?.id}
        mode={mode}
        storagePrefix={topic.storage_prefix}
        topicId={topic.id}
      />
    </Box>
  );
};

export default AdminTopic;
