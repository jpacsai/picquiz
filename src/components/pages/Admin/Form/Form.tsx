import { Box, Button, Typography } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';

import { createTopicItem } from '../../../../service/items';
import { uploadResponsiveTopicImages } from '../../../../data/storage';
import { generateResponsiveImageVariants } from '../../../../lib/image';
import type { TopicField } from '../../../../types/topics';
import FormField from './FormField';
import { getDefaultValues, getDerivationIndex } from './utils';

type FormProps = {
  collectionName: string;
  fields: TopicField[];
  storagePrefix: string;
};

const Form = ({ collectionName, fields, storagePrefix }: FormProps) => {
  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);
  const [pendingImageSelection, setPendingImageSelection] = useState<{
    field: Extract<TopicField, { type: 'imageUpload' }>;
    file: File;
    previewUrl: string;
  } | null>(null);

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
      let submittedValue = { ...value };

      if (pendingImageSelection) {
        const { field, file } = pendingImageSelection;
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

          form.setFieldValue(field.targetFields.desktop, uploadedImages.desktop.url);
          form.setFieldValue(field.targetFields.mobile, uploadedImages.mobile.url);

          submittedValue = {
            ...submittedValue,
            [field.targetFields.desktop]: uploadedImages.desktop.url,
            [field.targetFields.mobile]: uploadedImages.mobile.url,
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
            Feltoltesre varo kep
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

      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
};

export default Form;
