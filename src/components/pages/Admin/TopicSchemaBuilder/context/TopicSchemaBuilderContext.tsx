import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

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

  const stateValue = useTopicSchemaBuilderStateValue({
    draft,
    fixedImageUploadFieldDraft,
    initialDraft,
    isAddFieldDialogOpen,
    isDeleteFieldDialogOpen,
    isEditFieldDialogOpen,
    isSaving,
    mode,
    newFieldDraft,
    selectedFieldIndex,
    submitError,
    topic,
  });

  useEffect(() => {
    if (!stateValue.isDirty) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stateValue.isDirty]);

  const actionsValue = buildTopicSchemaBuilderActionsValue({
    canAddField: stateValue.canAddField,
    canSave: stateValue.canSave,
    draft,
    fixedImageUploadFieldDraft,
    isDirty: stateValue.isDirty,
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

  return (
    <TopicSchemaBuilderStateContext.Provider value={stateValue}>
      <TopicSchemaBuilderActionsContext.Provider value={actionsValue}>
        {children}
      </TopicSchemaBuilderActionsContext.Provider>
    </TopicSchemaBuilderStateContext.Provider>
  );
};
