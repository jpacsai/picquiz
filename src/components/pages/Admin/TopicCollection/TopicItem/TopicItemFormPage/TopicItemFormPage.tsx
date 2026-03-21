import { Box } from '@mui/material';

import TopicItemForm from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemFormPage/TopicItemForm/TopicItemForm';
import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

type AdminTopicItemFormPageProps = {
  initialValues?: Record<string, unknown>;
  item?: TopicItem;
  mode?: 'create' | 'edit';
  topic: Topic;
};

const AdminTopicItemFormPage = ({
  initialValues,
  item,
  mode = 'create',
  topic,
}: AdminTopicItemFormPageProps) => {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TopicItemForm
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

export default AdminTopicItemFormPage;
