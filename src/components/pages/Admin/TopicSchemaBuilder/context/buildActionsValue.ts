import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopic, updateTopic } from '@service/topics';
import type { QueryClient } from '@tanstack/react-query';
import type { NavigateFn } from '@tanstack/react-router';
import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

import type { TopicFieldDraft } from '@/types/topicSchema';
import type { Topic } from '@/types/topics';
import type { SelectedFieldIndex, TopicSchemaBuilderPageProps } from '@/types/topicSchemaBuilder';

import {
  getEmptyFieldDraft,
  getPersistedTopicValues,
  getSelectOptionsText,
  normalizeImageUploadField,
} from '../hook/utils';
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
  setIsEditFieldDialogOpen,
  setIsSaving,
  setNewFieldDraft,
  setSelectedFieldIndex,
  setSubmitError,
  topic,
}: BuildActionsValueParams): TopicSchemaBuilderActionsValue => {
  const handleCloseAddFieldDialog = () => {
    setIsAddFieldDialogOpen(false);
    setNewFieldDraft(getEmptyFieldDraft());
  };

  const handleCloseEditFieldDialog = () => {
    setIsEditFieldDialogOpen(false);
  };

  const handleAddField = () => {
    if (!canAddField || !newFieldDraft.type) {
      return;
    }

    const normalizedField: TopicFieldDraft =
      newFieldDraft.type === 'select'
        ? {
            ...newFieldDraft,
            options: newFieldDraft.options ?? [],
          }
        : newFieldDraft;

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: [...currentDraft.fields, normalizedField],
    }));
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

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.map((field, index) =>
        index === selectedFieldIndex ? updater(field) : field,
      ),
    }));
  };

  const handleDeleteSelectedField = () => {
    if (selectedFieldIndex === null || selectedFieldIndex === 'fixed-image-upload') {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      fields: currentDraft.fields.filter((_, index) => index !== selectedFieldIndex),
    }));
    setIsEditFieldDialogOpen(false);
    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (draft.fields.length <= 1) {
        return null;
      }

      return Math.max(0, currentIndex - 1);
    });
  };

  const handleEditFieldSubmit = () => {
    if (selectedFieldIndex === 'fixed-image-upload') {
      setDraft((currentDraft) => ({
        ...currentDraft,
        fields: [...currentDraft.fields, normalizeImageUploadField(fixedImageUploadFieldDraft)],
      }));
      setSelectedFieldIndex(draft.fields.length);
    }

    setIsEditFieldDialogOpen(false);
  };

  const handleMoveField = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    setDraft((currentDraft) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentDraft.fields.length ||
        toIndex >= currentDraft.fields.length
      ) {
        return currentDraft;
      }

      const nextFields = [...currentDraft.fields];
      const [movedField] = nextFields.splice(fromIndex, 1);

      nextFields.splice(toIndex, 0, movedField);

      return {
        ...currentDraft,
        fields: nextFields,
      };
    });

    setSelectedFieldIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 'fixed-image-upload') {
        return currentIndex;
      }

      if (currentIndex === fromIndex) {
        return toIndex;
      }

      if (fromIndex < toIndex && currentIndex > fromIndex && currentIndex <= toIndex) {
        return currentIndex - 1;
      }

      if (toIndex < fromIndex && currentIndex >= toIndex && currentIndex < fromIndex) {
        return currentIndex + 1;
      }

      return currentIndex;
    });
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

        const hasExistingTopic = previousTopics.some((previousTopic) => previousTopic.id === topicId);

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

      await navigate({
        to: '/admin',
      });
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
    handleCloseEditFieldDialog,
    handleDeleteSelectedField,
    handleEditFieldSubmit,
    handleMoveField,
    handleSave,
    setDraft,
    setIsAddFieldDialogOpen,
    setIsEditFieldDialogOpen,
    setNewFieldDraft,
    setSelectedFieldIndex,
    updateSelectedField,
  };
};
