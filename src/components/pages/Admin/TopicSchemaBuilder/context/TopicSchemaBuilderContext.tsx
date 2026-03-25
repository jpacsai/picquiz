import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { type PropsWithChildren, useState } from 'react';

import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import { getEmptyFieldDraft, getFixedImageUploadFieldDraft, getInitialDraft } from '../hook/utils';
import { buildTopicSchemaBuilderActionsValue } from './buildActionsValue';
import { useTopicSchemaBuilderStateValue } from './buildStateValue';
import {
  TopicSchemaBuilderActionsContext,
  TopicSchemaBuilderStateContext,
} from './topicSchemaBuilderContexts';

export const TopicSchemaBuilderProvider = ({
  children,
  mode,
  topic,
}: PropsWithChildren<TopicSchemaBuilderPageProps>) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [draft, setDraft] = useState(() => getInitialDraft(topic));
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isDeleteFieldDialogOpen, setIsDeleteFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fixedImageUploadFieldDraft, setFixedImageUploadFieldDraft] = useState(
    () =>
      draft.fields.find((field) => field.type === 'imageUpload') ?? getFixedImageUploadFieldDraft(),
  );
  const [newFieldDraft, setNewFieldDraft] = useState(() => getEmptyFieldDraft());
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<SelectedFieldIndex>(null);
  const [submitError, setSubmitError] = useState('');

  const stateValue = useTopicSchemaBuilderStateValue({
    draft,
    fixedImageUploadFieldDraft,
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

  const actionsValue = buildTopicSchemaBuilderActionsValue({
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

  return (
    <TopicSchemaBuilderStateContext.Provider value={stateValue}>
      <TopicSchemaBuilderActionsContext.Provider value={actionsValue}>
        {children}
      </TopicSchemaBuilderActionsContext.Provider>
    </TopicSchemaBuilderStateContext.Provider>
  );
};
