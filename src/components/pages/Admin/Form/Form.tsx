import { Box, Button } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { getResponsiveImageFileNames, uploadResponsiveTopicImages } from '../../../../data/storage';
import { generateResponsiveImageVariants } from '../../../../lib/image';
import type { TopicField } from '../../../../types/topics';
import FormInput from '../../../ui/Form/FormInput';
import FormSelect from '../../../ui/Form/FormSelect';
import ImageUploadDialog from './ImageUploadDialog';
import { getDefaultValues, getDerivationIndex, getDerivedValue, getFieldValidator } from './utils';

type FieldsProps = {
  fields: TopicField[];
  storagePrefix: string;
};

const Fields = ({ fields, storagePrefix }: FieldsProps) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);
  const imageUploadField = fields.find((field) => field.type === 'imageUpload');

  const renderPendingDerivedField = (key: string) => (
    <Box
      key={key}
      aria-hidden
      sx={{
        minHeight: 80,
        width: '100%',
      }}
    />
  );

  const renderField = (field: TopicField) => {
    const { key, type, readonly, required, label, fn, hideInEdit } = field;

    if (hideInEdit) return;

    switch (type) {
      case 'string':
      case 'number':
        return (
          <form.Field key={key} name={key} validators={{ onChange: getFieldValidator(field) }}>
            {(fieldApi) => {
              const errorMessage = fieldApi.state.meta.isTouched
                ? fieldApi.state.meta.errors[0]
                : undefined;

              const isPendingDerivedField = Boolean(fn) && fieldApi.state.value === '';

              if (isPendingDerivedField) {
                return renderPendingDerivedField(key);
              }

              return (
                <FormInput
                  type={type === 'number' ? 'number' : undefined}
                  name={key}
                  label={label}
                  required={required}
                  disabled={readonly}
                  value={fieldApi.state.value}
                  onBlur={fieldApi.handleBlur}
                  onChange={(event) => {
                    const rawValue = event.target.value;
                    const nextValue =
                      type === 'number' ? (rawValue === '' ? '' : Number(rawValue)) : rawValue;

                    fieldApi.handleChange(nextValue);

                    const derivedField = derivationIndex[key];
                    const derivedValue = getDerivedValue(derivedField, nextValue);

                    if (derivedField?.fn?.target && derivedValue !== undefined) {
                      form.setFieldValue(derivedField.fn.target, derivedValue);
                    }
                  }}
                  errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
                  sx={{ width: '100%', height: '75px' }}
                />
              );
            }}
          </form.Field>
        );
      case 'select':
        return (
          <form.Field key={key} name={key} validators={{ onChange: getFieldValidator(field) }}>
            {(fieldApi) => {
              const errorMessage = fieldApi.state.meta.isTouched
                ? fieldApi.state.meta.errors[0]
                : undefined;

              const isPendingDerivedField = Boolean(field.fn) && fieldApi.state.value === '';

              if (isPendingDerivedField) {
                return renderPendingDerivedField(key);
              }

              return (
                <FormSelect
                  options={field.options}
                  value={typeof fieldApi.state.value === 'string' ? fieldApi.state.value : ''}
                  onChange={(nextValue) => {
                    fieldApi.handleChange(nextValue);

                    const derivedField = derivationIndex[key];
                    const derivedValue = getDerivedValue(derivedField, nextValue);

                    if (derivedField?.fn?.target && derivedValue !== undefined) {
                      form.setFieldValue(derivedField.fn.target, derivedValue);
                    }
                  }}
                  onBlur={fieldApi.handleBlur}
                  disabled={readonly}
                  name={key}
                  label={label}
                  required={required}
                  errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
                />
              );
            }}
          </form.Field>
        );
      case 'imageUpload':
        return (
          <form.Subscribe key={key} selector={(state) => state.values}>
            {(values) => {
              const artistValue = values[field.fileNameFields.artist];
              const titleValue = values[field.fileNameFields.title];
              const isReadyForUpload =
                typeof artistValue === 'string' &&
                artistValue.trim().length > 0 &&
                typeof titleValue === 'string' &&
                titleValue.trim().length > 0;

              return (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 1,
                    marginTop: '22px',
                  }}
                >
                  <Button
                    variant="contained"
                    disabled={!isReadyForUpload}
                    onClick={() => setIsImageDialogOpen(true)}
                  >
                    {label}
                  </Button>
                  {!isReadyForUpload && field.buttonLabel ? (
                    <Box
                      component="span"
                      sx={{
                        color: 'text.secondary',
                        fontSize: 12,
                      }}
                    >
                      {field.buttonLabel}
                    </Box>
                  ) : null}
                </Box>
              );
            }}
          </form.Subscribe>
        );
      default:
        return <Box key={key}>{label}</Box>;
    }
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      console.log('submit', value);
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
        {fields.map((field) => renderField(field))}
      </Box>

      <Button type="submit" variant="contained">
        Submit
      </Button>

      {imageUploadField ? (
        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const artistValue = values[imageUploadField.fileNameFields.artist];
            const titleValue = values[imageUploadField.fileNameFields.title];
            const generatedFileNames = getResponsiveImageFileNames({
              artistName: typeof artistValue === 'string' ? artistValue : '',
              title: typeof titleValue === 'string' ? titleValue : '',
            });

            return (
              <ImageUploadDialog
                open={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                generatedFileNames={generatedFileNames}
                onUpload={async (file) => {
                  const { desktop, mobile } = await generateResponsiveImageVariants(file);
                  const uploadedImages = await uploadResponsiveTopicImages({
                    artistName: typeof artistValue === 'string' ? artistValue : '',
                    title: typeof titleValue === 'string' ? titleValue : '',
                    storagePrefix,
                    desktopBlob: desktop.blob,
                    mobileBlob: mobile.blob,
                  });

                  form.setFieldValue(
                    imageUploadField.targetFields.desktop,
                    uploadedImages.desktop.url,
                  );
                  form.setFieldValue(
                    imageUploadField.targetFields.mobile,
                    uploadedImages.mobile.url,
                  );
                }}
              />
            );
          }}
        </form.Subscribe>
      ) : null}
    </form>
  );
};

export default Fields;
