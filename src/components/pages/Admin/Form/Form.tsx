import { deleteTopicImageByPath, uploadResponsiveTopicImages } from '@data/storage';
import { generateResponsiveImageVariants } from '@lib/image';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { QUERY_KEYS } from '@queries/queryKeys';
import { createTopicItem, updateTopicItem } from '@service/items';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { TopicField } from '@/types/topics';

import FormField from './FormField';
import {
  getDerivationIndex,
  getInitialValues,
  getPersistableValue,
  type PendingImageSelection,
  validateImageUploads,
} from './utils';

export type FormMode = 'create' | 'edit';

type FormProps = {
  collectionName: string;
  fields: TopicField[];
  initialValues?: Record<string, unknown>;
  itemId?: string;
  mode?: FormMode;
  storagePrefix: string;
  topicId: string;
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
  const desktopTargetField = field.targetFields.desktop;
  const mobileTargetField = field.targetFields.mobile;

  if (!desktopTargetField || !mobileTargetField) {
    throw new Error(
      'Az imageUpload field nincs jól konfigurálva: hiányzik a targetFields.desktop vagy targetFields.mobile.',
    );
  }

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

const Form = ({
  collectionName,
  fields,
  initialValues,
  itemId,
  mode = 'create',
  storagePrefix,
  topicId,
}: FormProps) => {
  const defaultValues = getInitialValues(fields, initialValues);
  const derivationIndex = getDerivationIndex(fields);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string>('');
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

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {fields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            form={form}
            derivationIndex={derivationIndex}
            mode={mode}
            pendingImageSelection={pendingImageSelection}
            onSelectPendingImage={({ field: imageUploadField, file }) => {
              if (pendingImageSelection?.previewUrl) {
                URL.revokeObjectURL(pendingImageSelection.previewUrl);
              }

              setPendingImageSelection({
                field: imageUploadField,
                file,
                previewUrl: URL.createObjectURL(file),
              });
            }}
          />
        ))}
      </Box>

      {pendingImageSelection ? (
        <Box
          sx={{
            marginBottom: '24px',
          }}
        >
          <Typography gutterBottom variant="subtitle2">
            Feltöltésre váró kép
          </Typography>
          <Box
            component="img"
            src={pendingImageSelection.previewUrl}
            alt={pendingImageSelection.file.name}
            sx={{
              display: 'block',
              width: 180,
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              objectFit: 'contain',
              backgroundColor: 'background.paper',
            }}
          />
          <Typography sx={{ marginTop: 1 }} variant="body2" color="text.secondary">
            {pendingImageSelection.file.name}
          </Typography>
        </Box>
      ) : null}

      {submitError ? (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {submitError}
        </Alert>
      ) : null}

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} color="inherit" />
            Mentés...
          </Box>
        ) : (
          'Mentés'
        )}
      </Button>
    </form>
  );
};

export default Form;
