import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import {
  getDerivedValue,
  getFieldValidator,
} from '@/components/pages/Admin/TopicItemFormPage/TopicItemForm/utils';
import type {
  FormDeriveField,
  FormFieldFormApi,
  FormMode,
  PendingImageSelection,
  PendingImageSelectionInput,
} from '@/types/topicItemForm';
import type { TopicField } from '@/types/topics';

import FormInput from './FormInput';
import FormSelect from './FormSelect';
import ImageUploadField from './ImageUploadField';

type FormFieldProps = {
  fields: TopicField[];
  derivationIndex: Record<string, FormDeriveField>;
  field: TopicField;
  form: FormFieldFormApi;
  autocompleteOptions?: string[];
  onSelectPendingImage: (selection: PendingImageSelectionInput) => void;
  pendingImageSelection?: PendingImageSelection | null;
  mode: FormMode;
};

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

const getNormalizedImageUploadFileNamePart = (value: unknown): string | null => {
  if (typeof value === 'boolean') {
    return value ? 'Igaz' : 'Hamis';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
};

const FormField = ({
  fields,
  derivationIndex,
  field,
  form,
  autocompleteOptions,
  mode,
  onSelectPendingImage,
  pendingImageSelection,
}: FormFieldProps) => {
  const { key, type, readonly, required, label, fn, hideInEdit } = field;

  if (mode === 'edit' && hideInEdit) return null;

  switch (type) {
    case 'string':
    case 'number':
    case 'year':
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
                type={type === 'number' || type === 'year' ? 'number' : undefined}
                name={key}
                label={label}
                required={required}
                disabled={readonly}
                value={fieldApi.state.value}
                inputProps={
                  type === 'year'
                    ? {
                        max:
                          field.max === 'todayYear'
                            ? new Date().getFullYear()
                            : typeof field.max === 'number'
                              ? field.max
                              : undefined,
                        min: field.min,
                        step: 1,
                      }
                    : undefined
                }
                options={type === 'string' && field.autocomplete ? autocompleteOptions : undefined}
                onBlur={fieldApi.handleBlur}
                onChange={(event) => {
                  const rawValue = event.target.value;
                  const nextValue =
                    type === 'number' || type === 'year'
                      ? (rawValue === '' ? '' : Number(rawValue))
                      : rawValue;

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
    case 'boolean':
      return (
        <form.Field key={key} name={key} validators={{ onChange: getFieldValidator(field) }}>
          {(fieldApi) => {
            const errorMessage = fieldApi.state.meta.isTouched
              ? fieldApi.state.meta.errors[0]
              : undefined;

            return (
              <Box sx={{ width: '100%', minHeight: '75px', display: 'grid', alignContent: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={fieldApi.state.value === true}
                      disabled={readonly}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => {
                        fieldApi.handleChange(event.target.checked);
                      }}
                    />
                  }
                  label={label}
                />
                <Typography color="text.secondary" variant="body2">
                  {fieldApi.state.value === true ? 'Igaz' : 'Hamis'}
                </Typography>
                {typeof errorMessage === 'string' ? (
                  <Typography color="error" variant="caption">
                    {errorMessage}
                  </Typography>
                ) : null}
              </Box>
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
            const fileNameParts = field.fileNameFields
              .map((fieldKey) => getNormalizedImageUploadFileNamePart(values[fieldKey]))
              .filter((value): value is string => value !== null);
            const requiredFileNameFields = field.fileNameFields
              .map((fieldKey) => fields.find((candidateField) => candidateField.key === fieldKey))
              .filter((candidateField): candidateField is TopicField => Boolean(candidateField));
            const requiredFileNameLabels = requiredFileNameFields.map(
              (requiredField) => requiredField.label,
            );
            const isReadyForUpload =
              requiredFileNameFields.length > 0 &&
              requiredFileNameFields.every((requiredField) =>
                getNormalizedImageUploadFileNamePart(values[requiredField.key]) !== null,
              );
            const helperText =
              requiredFileNameLabels.length > 0
                ? `Add meg a kötelező mezők értékeit: ${requiredFileNameLabels.join(', ')}`
                : 'Add meg a kötelező mezők értékeit.';
            const desktopImageValue = values[field.targetFields.desktop];
            const mobileImageValue = values[field.targetFields.mobile];
            const existingImageUrl =
              typeof desktopImageValue === 'string' && desktopImageValue.trim().length > 0
                ? desktopImageValue
                : typeof mobileImageValue === 'string' && mobileImageValue.trim().length > 0
                  ? mobileImageValue
                  : null;

            return (
              <ImageUploadField
                field={field}
                existingImageUrl={existingImageUrl}
                fileNameParts={fileNameParts}
                helperText={helperText}
                isReadyForUpload={isReadyForUpload}
                mode={mode}
                existingSelection={
                  pendingImageSelection?.field.key === field.key ? pendingImageSelection : null
                }
                uniqueSuffix={
                  pendingImageSelection?.field.key === field.key
                    ? pendingImageSelection.uniqueSuffix
                    : undefined
                }
                onSelectImage={({ file, uniqueSuffix }) => {
                  onSelectPendingImage({ field, file, uniqueSuffix });
                }}
              />
            );
          }}
        </form.Subscribe>
      );
    default:
      return <Box key={key}>{label}</Box>;
  }
};

export default FormField;
