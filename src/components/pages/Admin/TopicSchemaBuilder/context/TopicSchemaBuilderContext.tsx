import { useQueryClient } from '@tanstack/react-query';
import { useBlocker, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { type PropsWithChildren, useMemo, useState } from 'react';

import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import {
  getDuplicateDraft,
  getEmptyFieldDraft,
  getFixedImageUploadFieldDraft,
  getInitialDraft,
} from '../hook/utils';
import { buildTopicSchemaBuilderActionsValue } from './buildActionsValue';
import { useTopicSchemaBuilderStateValue } from './buildStateValue';
import {
  TopicSchemaBuilderActionsContext,
  TopicSchemaBuilderStateContext,
} from './topicSchemaBuilderContexts';

export const TopicSchemaBuilderProvider = ({
  children,
  mode,
  sourceTopic,
  topic,
}: PropsWithChildren<TopicSchemaBuilderPageProps>) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const initialDraft = useMemo(
    () =>
      mode === 'edit'
        ? getInitialDraft(topic)
        : sourceTopic
          ? getDuplicateDraft(sourceTopic)
          : getInitialDraft(),
    [mode, sourceTopic, topic],
  );
  const initialFixedImageUploadFieldDraft = useMemo(
    () =>
      initialDraft.fields.find((field) => field.type === 'imageUpload') ?? getFixedImageUploadFieldDraft(),
    [initialDraft],
  );
  const [draft, setDraft] = useState(() => initialDraft);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isDeleteFieldDialogOpen, setIsDeleteFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fixedImageUploadFieldDraft, setFixedImageUploadFieldDraft] = useState(
    () => initialFixedImageUploadFieldDraft,
  );
  const [newFieldDraft, setNewFieldDraft] = useState(() => getEmptyFieldDraft());
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<SelectedFieldIndex>(null);
  const [submitError, setSubmitError] = useState('');

  const baseStateValue = useTopicSchemaBuilderStateValue({
    draft,
    fixedImageUploadFieldDraft,
    initialDraft,
    isAddFieldDialogOpen,
    isDeleteFieldDialogOpen,
    isEditFieldDialogOpen,
    isSaving,
    isUnsavedChangesDialogOpen: false,
    mode,
    newFieldDraft,
    selectedFieldIndex,
    submitError,
    topic,
  });

  const navigationBlocker = useBlocker({
    disabled: !baseStateValue.isDirty || isSaving,
    enableBeforeUnload: true,
    shouldBlockFn: () => true,
    withResolver: true,
  });

  const stateValue = {
    ...baseStateValue,
    isUnsavedChangesDialogOpen: navigationBlocker.status === 'blocked',
  };

  const baseActionsValue = buildTopicSchemaBuilderActionsValue({
    canAddField: stateValue.canAddField,
    canSave: stateValue.canSave,
    draft,
    fixedImageUploadFieldDraft,
    mode,
    navigate,
    newFieldDraft,
    enqueueSnackbar,
    queryClient,
    selectedFieldIndex,
    setDraft,
    setFixedImageUploadFieldDraft,
    setIsAddFieldDialogOpen,
    setIsDeleteFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setIsSaving,
    setNewFieldDraft,
    setSelectedFieldIndex,
    setSubmitError,
    topic,
  });

  const actionsValue = {
    ...baseActionsValue,
    handleConfirmNavigation: () => navigationBlocker.proceed?.(),
    handleStayOnPage: () => navigationBlocker.reset?.(),
  };

  return (
    <TopicSchemaBuilderStateContext.Provider value={stateValue}>
      <TopicSchemaBuilderActionsContext.Provider value={actionsValue}>
        {children}
      </TopicSchemaBuilderActionsContext.Provider>
    </TopicSchemaBuilderStateContext.Provider>
  );
};
