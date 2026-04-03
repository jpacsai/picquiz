import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopic, updateTopic } from '@service/topics';
import type { QueryClient } from '@tanstack/react-query';
import type { NavigateFn } from '@tanstack/react-router';
import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

import type { TopicFieldDraft } from '@/types/topicSchema';
import type { Topic } from '@/types/topics';
import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import { getEmptyFieldDraft, getPersistedTopicValues, getSelectOptionsText } from '../hook/utils';
import {
  appendFieldToDraft,
  getSelectedFieldIndexAfterDelete,
  getSelectedFieldIndexAfterMove,
  insertNormalizedFixedImageUploadField,
  moveDraftField,
  removeDraftFieldAtIndex,
  updateDraftFieldAtIndex,
} from './fieldActions';
import type { TopicSchemaBuilderActionsValue, TopicSchemaBuilderStateValue } from './types';

type BuildActionsValueParams = {
  canAddField: boolean;
  canSave: boolean;
  draft: TopicSchemaBuilderStateValue['draft'];
  fixedImageUploadFieldDraft: NonNullable<TopicSchemaBuilderStateValue['selectedField']>;
  mode: TopicSchemaBuilderPageProps['mode'];
  navigate: NavigateFn;
  newFieldDraft: TopicSchemaBuilderStateValue['newFieldDraft'];
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
  queryClient: QueryClient;
  selectedFieldIndex: SelectedFieldIndex;
  setDraft: TopicSchemaBuilderActionsValue['setDraft'];
  setFixedImageUploadFieldDraft: React.Dispatch<React.SetStateAction<TopicFieldDraft>>;
  setIsAddFieldDialogOpen: TopicSchemaBuilderActionsValue['setIsAddFieldDialogOpen'];
  setIsDeleteFieldDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditFieldDialogOpen: TopicSchemaBuilderActionsValue['setIsEditFieldDialogOpen'];
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setNewFieldDraft: TopicSchemaBuilderActionsValue['setNewFieldDraft'];
  setSelectedFieldIndex: TopicSchemaBuilderActionsValue['setSelectedFieldIndex'];
  setSubmitError: React.Dispatch<React.SetStateAction<string>>;
  topic: TopicSchemaBuilderPageProps['topic'];
};

export const buildTopicSchemaBuilderActionsValue = ({
  canAddField,
  canSave,
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
}: BuildActionsValueParams): TopicSchemaBuilderActionsValue => {
  const handleNavigateBack = async () => {
    await navigate(
      mode === 'edit' && topic
        ? {
            to: '/$topicId',
            params: { topicId: topic.id },
          }
        : {
            to: '/admin',
            search: {
              schemaDialog: undefined,
              schemaMode: undefined,
              sourceTopicId: undefined,
            },
          },
    );
  };

  const handleCloseAddFieldDialog = () => {
    setIsAddFieldDialogOpen(false);
    setNewFieldDraft(getEmptyFieldDraft());
  };

  const handleCloseEditFieldDialog = () => {
    setIsEditFieldDialogOpen(false);
  };

  const handleOpenDeleteFieldDialog = () => {
    setIsDeleteFieldDialogOpen(true);
  };

  const handleCloseDeleteFieldDialog = () => {
    setIsDeleteFieldDialogOpen(false);
  };

  const handleAddField = () => {
    if (!canAddField || !newFieldDraft.type) {
      return;
    }

    setDraft((currentDraft) => appendFieldToDraft(currentDraft, newFieldDraft));
    setSelectedFieldIndex(draft.fields.length);
    handleCloseAddFieldDialog();
  };

  const updateSelectedField = (updater: (field: TopicFieldDraft) => TopicFieldDraft) => {
    if (selectedFieldIndex === null) {
      return;
    }

    if (selectedFieldIndex === 'fixed-image-upload') {
      setFixedImageUploadFieldDraft((currentField) => updater(currentField));
      return;
    }

    setDraft((currentDraft) => updateDraftFieldAtIndex(currentDraft, selectedFieldIndex, updater));
  };

  const handleConfirmDeleteSelectedField = () => {
    if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
      return;
    }

    setDraft((currentDraft) => removeDraftFieldAtIndex(currentDraft, selectedFieldIndex));
    setIsDeleteFieldDialogOpen(false);
    setIsEditFieldDialogOpen(false);
    setSelectedFieldIndex((currentIndex) =>
      getSelectedFieldIndexAfterDelete({
        fieldCount: draft.fields.length,
        selectedFieldIndex: currentIndex,
      }),
    );
  };

  const handleEditFieldSubmit = () => {
    if (selectedFieldIndex === 'fixed-image-upload') {
      setDraft((currentDraft) =>
        insertNormalizedFixedImageUploadField(currentDraft, fixedImageUploadFieldDraft),
      );
      setSelectedFieldIndex(draft.fields.length);
    }

    setIsEditFieldDialogOpen(false);
  };

  const handleMoveField = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    setDraft((currentDraft) => moveDraftField(currentDraft, { fromIndex, toIndex }));

    setSelectedFieldIndex((currentIndex) =>
      getSelectedFieldIndexAfterMove({
        fields: draft.fields,
        fromIndex,
        selectedFieldIndex: currentIndex,
        toIndex,
      }),
    );
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSubmitError('');
    setIsSaving(true);

    try {
      const topicId = mode === 'edit' ? topic?.id : draft.id?.trim();

      if (!topicId) {
        throw new Error('Hianyzik a topic azonosito a menteshez.');
      }

      const values = getPersistedTopicValues(draft);

      if (mode === 'edit') {
        await updateTopic({
          topicId,
          values,
        });
      } else {
        await createTopic({
          topicId,
          values,
        });
      }

      const nextTopic: Topic = {
        id: topicId,
        ...values,
      };

      queryClient.setQueryData(QUERY_KEYS.TOPICS.byId(topicId), nextTopic);
      queryClient.setQueryData<ReadonlyArray<Topic>>(QUERY_KEYS.TOPICS.list(), (previousTopics) => {
        if (!previousTopics) {
          return [nextTopic];
        }

        const hasExistingTopic = previousTopics.some(
          (previousTopic) => previousTopic.id === topicId,
        );

        if (!hasExistingTopic) {
          return [...previousTopics, nextTopic];
        }

        return previousTopics.map((previousTopic) =>
          previousTopic.id === topicId ? nextTopic : previousTopic,
        );
      });

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.list(),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TOPICS.byId(topicId),
      });

      enqueueSnackbar(
        mode === 'edit' ? 'A topic schema modositasai elmentve.' : 'Az uj topic schema elmentve.',
        {
          key: mode === 'edit' ? 'topic-schema-updated' : 'topic-schema-created',
          preventDuplicate: true,
          variant: 'success',
        },
      );

      await navigate(
        mode === 'edit' && topic
          ? {
              to: '/$topicId',
              params: { topicId: topic.id },
            }
          : {
              to: '/admin',
            },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen mentesi hiba.';
      console.error('Sikertelen topic schema mentes', error);
      setSubmitError(message);
      enqueueSnackbar(message, {
        key: 'topic-schema-save-error',
        preventDuplicate: true,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    getSelectOptionsText,
    handleAddField,
    handleCloseAddFieldDialog,
    handleCloseDeleteFieldDialog,
    handleCloseEditFieldDialog,
    handleConfirmDeleteSelectedField,
    handleEditFieldSubmit,
    handleConfirmNavigation: () => {},
    handleMoveField,
    handleNavigateBack,
    handleOpenDeleteFieldDialog,
    handleSave,
    handleStayOnPage: () => {},
    setDraft,
    setIsAddFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setNewFieldDraft,
    setSelectedFieldIndex,
    updateSelectedField,
  };
};
