import type { TopicField } from '@/types/topics';

import FormView from './FormView';
import { type FormMode, useAdminForm } from './useAdminForm';

type FormProps = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};

const Form = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: FormProps) => {
  const {
    derivationIndex,
    form,
    handleSelectPendingImage,
    isSubmitting,
    pendingImageSelection,
    submitError,
  } = useAdminForm({
    collectionName,
    fields,
    initialValues,
    itemId,
    mode,
    storagePrefix,
    topicId,
  });

  return (
    <FormView
      derivationIndex={derivationIndex}
      fields={fields}
      form={form}
      isSubmitting={isSubmitting}
      mode={mode}
      onSelectPendingImage={handleSelectPendingImage}
      pendingImageSelection={pendingImageSelection}
      submitError={submitError}
    />
  );
};

export default Form;
