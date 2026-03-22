import { Box } from '@mui/material';
import { topicOptions } from '@queries/topics';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import TopicItemForm from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemFormPage/TopicItemForm/TopicItemForm';
import type { TopicItem } from '@/service/items';
import type { Topic } from '@/types/topics';

import { mergeRefreshedSelectFieldOptions } from './TopicItemForm/utils';

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
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(topic.fields);
  const [isRefreshingSelectOptions, setIsRefreshingSelectOptions] = useState(false);

  useEffect(() => {
    setFields(topic.fields);
  }, [topic.fields]);

  const handleRefreshSelectOptions = async () => {
    setIsRefreshingSelectOptions(true);

    try {
      const refreshedTopic = await queryClient.fetchQuery(topicOptions(topic.id));

      setFields((currentFields) =>
        mergeRefreshedSelectFieldOptions({
          currentFields,
          refreshedFields: refreshedTopic.fields,
        }),
      );
    } finally {
      setIsRefreshingSelectOptions(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TopicItemForm
        collectionName={topic.slug}
        fields={fields}
        initialValues={initialValues}
        isRefreshingSelectOptions={isRefreshingSelectOptions}
        itemId={item?.id}
        mode={mode}
        onRefreshSelectOptions={handleRefreshSelectOptions}
        storagePrefix={topic.storage_prefix}
        topicId={topic.id}
      />
    </Box>
  );
};

export default AdminTopicItemFormPage;
