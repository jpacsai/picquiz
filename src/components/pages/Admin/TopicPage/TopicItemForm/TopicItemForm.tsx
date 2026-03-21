import type { TopicField } from '@/types/topics';

import TopicItemFormView from './TopicItemFormView';
import { type FormMode, useTopicItemForm } from './useTopicItemForm';

type TopicItemFormProps = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};

const TopicItemForm = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: TopicItemFormProps) => {
  const {
    derivationIndex,
    form,
    handleSelectPendingImage,
    handleUndo,
    isSubmitting,
    pendingImageSelection,
    submitError,
  } = useTopicItemForm({
    collectionName,
    fields,
    initialValues,
    itemId,
    mode,
    storagePrefix,
    topicId,
  });

  return (
    <TopicItemFormView
      derivationIndex={derivationIndex}
      fields={fields}
      form={form}
      isSubmitting={isSubmitting}
      mode={mode}
      onSelectPendingImage={handleSelectPendingImage}
      onUndo={handleUndo}
      pendingImageSelection={pendingImageSelection}
      submitError={submitError}
    />
  );
};

export default TopicItemForm;
