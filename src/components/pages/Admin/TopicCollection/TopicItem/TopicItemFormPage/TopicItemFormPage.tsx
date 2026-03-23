import { Box } from '@mui/material';
import { topicItemsOptions } from '@queries/items';
import { topicOptions } from '@queries/topics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import TopicItemForm from '@/components/pages/Admin/TopicCollection/TopicItem/TopicItemFormPage/TopicItemForm/TopicItemForm';
import type { Topic, TopicItem } from '@/types/topics';

import {
  getAutocompleteOptionsByField,
  mergeRefreshedSelectFieldOptions,
} from './TopicItemForm/utils';

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
  const { data: items = [] } = useQuery(topicItemsOptions(topic.slug));
  const autocompleteOptionsByField = getAutocompleteOptionsByField({
    currentItemId: item?.id,
    fields,
    items,
  });

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
        autocompleteOptionsByField={autocompleteOptionsByField}
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
