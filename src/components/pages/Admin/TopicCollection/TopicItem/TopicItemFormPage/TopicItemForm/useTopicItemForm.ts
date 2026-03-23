import {
  createImageFileUniqueSuffix,
  deleteTopicImageByPath,
} from '@data/storage';
import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopicItem, updateTopicItem } from '@service/items';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type {
  FormFieldFormApi,
  FormMode,
  PendingImageSelection,
  UseTopicItemFormResult,
} from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

import {
  getDerivationIndex,
  getInitialValues,
  getPersistableValue,
  resolveSubmittedValues,
  syncUpdatedItemCache,
  validateImageUploads,
} from './utils';

type UseTopicItemFormParams = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};


export const useTopicItemForm = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: UseTopicItemFormParams): UseTopicItemFormResult => {
  const defaultValues = getInitialValues(fields, initialValues);
  const derivationIndex = getDerivationIndex(fields);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImageSelection, setPendingImageSelection] = useState<PendingImageSelection | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (pendingImageSelection?.previewUrl) {
        URL.revokeObjectURL(pendingImageSelection.previewUrl);
      }
    };
  }, [pendingImageSelection]);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError('');
      setIsSubmitting(true);

      try {
        const previousValue = { ...value };
        const requiredImageUploadError = validateImageUploads({
          fields,
          pendingImageSelection,
          values: previousValue,
        });

        if (requiredImageUploadError) {
          throw new Error(requiredImageUploadError);
        }

        const { imagePathsToDelete, submittedValue } = await resolveSubmittedValues({
          form,
          mode,
          pendingImageSelection,
          previousValues: previousValue,
          storagePrefix,
        });

        if (pendingImageSelection?.previewUrl) {
          URL.revokeObjectURL(pendingImageSelection.previewUrl);
          setPendingImageSelection(null);
        }

        const persistableValue = getPersistableValue({
          fields,
          values: submittedValue,
        });

        if (mode === 'edit') {
          if (!itemId) {
            throw new Error('Hiányzó item azonosító az edit mentéshez.');
          }

          await updateTopicItem({
            collectionName,
            itemId,
            values: persistableValue,
          });

          syncUpdatedItemCache({
            collectionName,
            itemId,
            queryClient,
            values: persistableValue,
          });
        } else {
          await createTopicItem({
            collectionName,
            values: persistableValue,
          });
        }

        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ITEMS.byTopic(collectionName),
        });

        if (mode === 'edit' && itemId) {
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.ITEMS.detail(collectionName, itemId),
          });
        }

        if (imagePathsToDelete.length) {
          await Promise.all(imagePathsToDelete.map((path) => deleteTopicImageByPath(path)));
        }

        await navigate(
          mode === 'edit'
            ? {
                search: { saved: 'edited' },
                to: '/admin/$topicId',
                params: { topicId },
              }
            : {
                to: '/admin/$topicId/success',
                params: { topicId },
              },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ismeretlen mentési hiba.';
        console.error('Sikertelen mentés', error);
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleSelectPendingImage = ({
    field,
    file,
  }: {
    field: Extract<TopicField, { type: 'imageUpload' }>;
    file: File;
  }) => {
    if (pendingImageSelection?.previewUrl) {
      URL.revokeObjectURL(pendingImageSelection.previewUrl);
    }

    setPendingImageSelection({
      field,
      file,
      previewUrl: URL.createObjectURL(file),
      uniqueSuffix: createImageFileUniqueSuffix(),
    });
  };

  const handleUndo = () => {
    if (pendingImageSelection?.previewUrl) {
      URL.revokeObjectURL(pendingImageSelection.previewUrl);
    }

    setPendingImageSelection(null);
    setSubmitError('');
    form.reset();
  };

  return {
    derivationIndex,
    form: form as FormFieldFormApi,
    handleSelectPendingImage,
    handleUndo,
    isSubmitting,
    mode,
    pendingImageSelection,
    submitError,
  };
};
