import type { TopicField } from '@/types/topics';

import TopicItemFormView from './TopicItemFormView';
import { type FormMode, useTopicItemForm } from './useTopicItemForm';

type TopicItemFormProps = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  isRefreshingSelectOptions?: boolean;
  itemId?: string;
  mode?: FormMode;
  onRefreshSelectOptions?: () => void;
  storagePrefix: string;
  topicId: string;
};

const TopicItemForm = ({
  collectionName,
  fields,
  initialValues,
  isRefreshingSelectOptions = false,
  itemId,
  mode = 'create',
  onRefreshSelectOptions,
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
      isRefreshingSelectOptions={isRefreshingSelectOptions}
      mode={mode}
      onSelectPendingImage={handleSelectPendingImage}
      onRefreshSelectOptions={onRefreshSelectOptions}
      onUndo={handleUndo}
      pendingImageSelection={pendingImageSelection}
      submitError={submitError}
    />
  );
};

export default TopicItemForm;
