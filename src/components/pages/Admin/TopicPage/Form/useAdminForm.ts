import { deleteTopicImageByPath, uploadResponsiveTopicImages } from '@data/storage';
import { generateResponsiveImageVariants } from '@lib/image';
import { QUERY_KEYS } from '@queries/queryKeys';
import type { TopicItem } from '@service/items';
import { createTopicItem, updateTopicItem } from '@service/items';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { TopicField } from '@/types/topics';

import type { FormFieldFormApi } from '../../../ui/Form/FormField';
import {
  getDerivationIndex,
  getInitialValues,
  getPersistableValue,
  type PendingImageSelection,
  validateImageUploads,
} from './utils';

export type FormMode = 'create' | 'edit';

export type UseAdminFormParams = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
};

export type UseAdminFormResult = {
  derivationIndex: Record<string, ReturnType<typeof getDerivationIndex>[string]>;
  form: FormFieldFormApi;
  handleSelectPendingImage: ({
    field,
    file,
  }: {
    field: Extract<TopicField, { type: 'imageUpload' }>;
    file: File;
  }) => void;
  handleUndo: () => void;
  isSubmitting: boolean;
  mode: FormMode;
  pendingImageSelection: PendingImageSelection | null;
  submitError: string;
};

const getUploadedImageValues = ({
  field,
  uploadedImages,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  uploadedImages: Awaited<ReturnType<typeof uploadResponsiveTopicImages>>;
}) => {
  const nextValues: Record<string, string> = {
    [field.targetFields.desktop]: uploadedImages.desktop.url,
    [field.targetFields.mobile]: uploadedImages.mobile.url,
  };

  if (field.targetFields.desktopPath) {
    nextValues[field.targetFields.desktopPath] = uploadedImages.desktop.path;
  }

  if (field.targetFields.mobilePath) {
    nextValues[field.targetFields.mobilePath] = uploadedImages.mobile.path;
  }

  return nextValues;
};

const getPathsToDelete = ({
  field,
  previousValues,
  nextValues,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  nextValues: Record<string, string>;
  previousValues: Record<string, string | number>;
}) => {
  const pathKeys = [field.targetFields.desktopPath, field.targetFields.mobilePath].filter(
    (value): value is string => Boolean(value),
  );

  return [...new Set(pathKeys)]
    .map((pathKey) => {
      const previousPath = previousValues[pathKey];
      const nextPath = nextValues[pathKey];

      return typeof previousPath === 'string' &&
        previousPath.trim().length > 0 &&
        previousPath !== nextPath
        ? previousPath
        : null;
    })
    .filter((value): value is string => value !== null);
};

const resolveSubmittedValues = async ({
  form,
  pendingImageSelection,
  previousValues,
  storagePrefix,
  mode,
}: {
  form: {
    setFieldValue: (field: string, value: string | number) => void;
  };
  mode: FormMode;
  pendingImageSelection: PendingImageSelection | null;
  previousValues: Record<string, string | number>;
  storagePrefix: string;
}) => {
  if (!pendingImageSelection) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { field, file } = pendingImageSelection;
  const artistValue = previousValues[field.fileNameFields.artist];
  const titleValue = previousValues[field.fileNameFields.title];
  const artistName = typeof artistValue === 'string' ? artistValue : '';
  const title = typeof titleValue === 'string' ? titleValue : '';

  if (!artistName || !title) {
    return {
      imagePathsToDelete: [] as string[],
      submittedValue: previousValues,
    };
  }

  const { desktop, mobile } = await generateResponsiveImageVariants(file);
  const uploadedImages = await uploadResponsiveTopicImages({
    artistName,
    title,
    storagePrefix,
    desktopBlob: desktop.blob,
    mobileBlob: mobile.blob,
  });

  const uploadedImageValues = getUploadedImageValues({
    field,
    uploadedImages,
  });

  Object.entries(uploadedImageValues).forEach(([targetField, targetValue]) => {
    form.setFieldValue(targetField, targetValue);
  });

  return {
    imagePathsToDelete:
      mode === 'edit'
        ? getPathsToDelete({
            field,
            nextValues: uploadedImageValues,
            previousValues,
          })
        : [],
    submittedValue: {
      ...previousValues,
      ...uploadedImageValues,
    },
  };
};

const syncUpdatedItemCache = ({
  collectionName,
  itemId,
  queryClient,
  values,
}: {
  collectionName: string;
  itemId: string;
  queryClient: ReturnType<typeof useQueryClient>;
  values: Record<string, string | number>;
}) => {
  const nextItem: TopicItem = {
    id: itemId,
    ...values,
  };

  queryClient.setQueryData(QUERY_KEYS.ITEMS.detail(collectionName, itemId), nextItem);
  queryClient.setQueryData<ReadonlyArray<TopicItem>>(
    QUERY_KEYS.ITEMS.byTopic(collectionName),
    (previousItems) =>
      previousItems?.map((item) => (item.id === itemId ? { ...item, ...nextItem } : item)) ??
      previousItems,
  );
};

export const useAdminForm = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: UseAdminFormParams): UseAdminFormResult => {
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
