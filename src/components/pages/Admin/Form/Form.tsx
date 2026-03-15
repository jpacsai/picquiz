import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { uploadResponsiveTopicImages } from '@data/storage';
import { generateResponsiveImageVariants } from '@lib/image';
import { createTopicItem } from '@service/items';
import type { TopicField } from '@/types/topics';

import FormField from './FormField';
import { getDefaultValues, getDerivationIndex } from './utils';

type PendingImageSelection = {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  file: File;
  previewUrl: string;
};

type FormProps = {
  collectionName: string;
  fields: TopicField[];
  storagePrefix: string;
  topicId: string;
};

const getRequiredImageUploadError = ({
  field,
  pendingImageSelection,
  values,
}: {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  pendingImageSelection: PendingImageSelection | null;
  values: Record<string, string | number>;
}) => {
  if (!field.required) {
    return undefined;
  }

  const hasPendingSelection = pendingImageSelection?.field.key === field.key;
  const desktopUrl = values[field.targetFields.desktop];
  const mobileUrl = values[field.targetFields.mobile];
  const hasPersistedUrls =
    typeof desktopUrl === 'string' &&
    desktopUrl.trim().length > 0 &&
    typeof mobileUrl === 'string' &&
    mobileUrl.trim().length > 0;

  if (!hasPendingSelection && !hasPersistedUrls) {
    return `${field.label} kötelező.`;
  }

  return undefined;
};

const Form = ({ collectionName, fields, storagePrefix, topicId }: FormProps) => {
  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);
  const navigate = useNavigate();
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
        let submittedValue = { ...value };
        const requiredImageUploadError = fields
          .filter(
            (field): field is Extract<TopicField, { type: 'imageUpload' }> =>
              field.type === 'imageUpload',
          )
          .map((field) =>
            getRequiredImageUploadError({
              field,
              pendingImageSelection,
              values: submittedValue,
            }),
          )
          .find(Boolean);

        if (requiredImageUploadError) {
          throw new Error(requiredImageUploadError);
        }

        if (pendingImageSelection) {
          const { field, file } = pendingImageSelection;
          const desktopTargetField = field.targetFields?.desktop;
          const mobileTargetField = field.targetFields?.mobile;

          if (!desktopTargetField || !mobileTargetField) {
            throw new Error(
              'Az imageUpload field nincs jól konfigurálva: hiányzik a targetFields.desktop vagy targetFields.mobile.',
            );
          }

          const artistValue = submittedValue[field.fileNameFields.artist];
          const titleValue = submittedValue[field.fileNameFields.title];
          const artistName = typeof artistValue === 'string' ? artistValue : '';
          const title = typeof titleValue === 'string' ? titleValue : '';

          if (artistName && title) {
            const { desktop, mobile } = await generateResponsiveImageVariants(file);
            const uploadedImages = await uploadResponsiveTopicImages({
              artistName,
              title,
              storagePrefix,
              desktopBlob: desktop.blob,
              mobileBlob: mobile.blob,
            });

            form.setFieldValue(desktopTargetField, uploadedImages.desktop.url);
            form.setFieldValue(mobileTargetField, uploadedImages.mobile.url);

            submittedValue = {
              ...submittedValue,
              [desktopTargetField]: uploadedImages.desktop.url,
              [mobileTargetField]: uploadedImages.mobile.url,
            };

            URL.revokeObjectURL(pendingImageSelection.previewUrl);
            setPendingImageSelection(null);
          }
        }

        const persistableValue = fields.reduce<Record<string, string | number>>((acc, field) => {
          if (field.type === 'imageUpload') {
            return acc;
          }

          const nextValue = submittedValue[field.key];

          if (nextValue === undefined) {
            return acc;
          }

          const isEmptyValue = nextValue === '';

          if (!field.required && isEmptyValue) {
            return acc;
          }

          return {
            ...acc,
            [field.key]: nextValue,
          };
        }, {});

        await createTopicItem({
          collectionName,
          values: persistableValue,
        });

        await navigate({
          to: '/admin/$topicId/success',
          params: { topicId },
        });
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
