import { deleteTopicImageByPath } from '@data/storage';
import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopicItem, updateTopicItem } from '@service/items';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type {
  FormFieldFormApi,
  FormValues,
  FormMode,
  PendingImageSelection,
  UseTopicItemFormResult,
} from '@/types/topicItemForm';
import type { TopicField, TopicItem, TopicItemValues } from '@/types/topics';

import {
  getDerivationIndex,
  getInitialValues,
  getPersistableValue,
  resolveAutocompleteCopyValues,
  resolveSubmittedValues,
  syncUpdatedItemCache,
  validateImageUploads,
} from './utils';

type UseTopicItemFormParams = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  items: ReadonlyArray<TopicItem>;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};

const getStoragePathPrefixFromMessage = (message: string) => {
  const matchedPath = message.match(/access '([^']+)'/);
  const fullPath = matchedPath?.[1];

  if (!fullPath) {
    return null;
  }

  const [prefix] = fullPath.split('/');

  return prefix?.trim() ? prefix : null;
};

const getSubmitErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Ismeretlen mentési hiba.';
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : null;

  if (code === 'storage/unauthorized' || message.includes('(storage/unauthorized)')) {
    const storagePrefix = getStoragePathPrefixFromMessage(message);

    return storagePrefix
      ? `Nincs feltöltési jogosultság a(z) "${storagePrefix}" storage prefixhez. Valószínűleg a Firebase Storage szabályok még nem engedik ezt az útvonalat.`
      : 'Nincs feltöltési jogosultság ehhez a képútvonalhoz. Valószínűleg a Firebase Storage szabályok még nem engedik ezt a storage prefixet.';
  }

  return message;
};

export const useTopicItemForm = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  items,
  mode = 'create',
  storagePrefix,
  topicId,
}: UseTopicItemFormParams): UseTopicItemFormResult => {
  const defaultValues = getInitialValues(fields, initialValues);
  const derivationIndex = getDerivationIndex(fields);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState('');
  const [autocompleteCopyWarning, setAutocompleteCopyWarning] = useState('');
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
        const previousValue: TopicItemValues = { ...value };
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
                to: '/admin/$topicId/items',
                params: { topicId },
              }
            : {
                to: '/admin/$topicId/items/success',
                params: { topicId },
              },
        );
      } catch (error) {
        console.error('Sikertelen mentés', error);
        setSubmitError(getSubmitErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleSelectPendingImage = ({
    field,
    file,
    uniqueSuffix,
  }: {
    field: Extract<TopicField, { type: 'imageUpload' }>;
    file: File;
    uniqueSuffix: string;
  }) => {
    if (pendingImageSelection?.previewUrl) {
      URL.revokeObjectURL(pendingImageSelection.previewUrl);
    }

    setPendingImageSelection({
      field,
      file,
      previewUrl: URL.createObjectURL(file),
      uniqueSuffix,
    });
  };

  const handleAutocompleteCopy = ({
    field,
    values,
  }: {
    field: Extract<TopicField, { type: 'string' }>;
    values: FormValues;
  }) => {
    const { updates, warning } = resolveAutocompleteCopyValues({
      field,
      items,
      mode,
      values,
    });

    setAutocompleteCopyWarning(warning ?? '');

    Object.entries(updates).forEach(([targetField, targetValue]) => {
      form.setFieldValue(targetField, targetValue);
    });
  };

  const handleUndo = () => {
    if (pendingImageSelection?.previewUrl) {
      URL.revokeObjectURL(pendingImageSelection.previewUrl);
    }

    setAutocompleteCopyWarning('');
    setPendingImageSelection(null);
    setSubmitError('');
    form.reset();
  };

  return {
    autocompleteCopyWarning,
    derivationIndex,
    form: form as FormFieldFormApi,
    handleAutocompleteCopy,
    handleSelectPendingImage,
    handleUndo,
    isSubmitting,
    mode,
    pendingImageSelection,
    submitError,
  };
};
