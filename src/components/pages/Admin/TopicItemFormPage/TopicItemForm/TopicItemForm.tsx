import type { FormMode } from '@/types/topicItemForm';
import type { TopicField, TopicItem } from '@/types/topics';

import TopicItemFormView from './TopicItemFormView';
import { useTopicItemForm } from './useTopicItemForm';

type TopicItemFormProps = {
  autocompleteOptionsByField?: Record<string, string[]>;
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  isRefreshingSelectOptions?: boolean;
  itemId?: string;
  items?: ReadonlyArray<TopicItem>;
  mode?: FormMode;
  onRefreshSelectOptions?: () => void;
  storagePrefix: string;
  topicId: string;
};

const TopicItemForm = ({
  autocompleteOptionsByField,
  collectionName,
  fields,
  initialValues,
  isRefreshingSelectOptions = false,
  itemId,
  items = [],
  mode = 'create',
  onRefreshSelectOptions,
  storagePrefix,
  topicId,
}: TopicItemFormProps) => {
  const {
    autocompleteCopyWarning,
    derivationIndex,
    form,
    handleAutocompleteCopy,
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
    items,
    mode,
    storagePrefix,
    topicId,
  });

  return (
    <TopicItemFormView
      autocompleteCopyWarning={autocompleteCopyWarning}
      autocompleteOptionsByField={autocompleteOptionsByField}
      derivationIndex={derivationIndex}
      fields={fields}
      form={form}
      isSubmitting={isSubmitting}
      isRefreshingSelectOptions={isRefreshingSelectOptions}
      mode={mode}
      onAutocompleteCopy={handleAutocompleteCopy}
      onSelectPendingImage={handleSelectPendingImage}
      onRefreshSelectOptions={onRefreshSelectOptions}
      onUndo={handleUndo}
      pendingImageSelection={pendingImageSelection}
      submitError={submitError}
    />
  );
};

export default TopicItemForm;
