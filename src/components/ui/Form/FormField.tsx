import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import {
  buildYearRangeValue,
  getDerivedValue,
  getFieldValidator,
  parseYearRangeValue,
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
import ImageUploadField from './ImageUploadField/ImageUploadField';

type FormFieldProps = {
  derivationIndex: Record<string, FormDeriveField>;
  fields: TopicField[];
  field: TopicField;
  form: FormFieldFormApi;
  formValues: Record<string, string | number | boolean>;
  autocompleteOptions?: string[];
  mode: FormMode;
  onAutocompleteCopy: (params: {
    field: Extract<TopicField, { type: 'string' }>;
    values: Record<string, string | number | boolean>;
  }) => void;
  onSelectPendingImage: (selection: PendingImageSelectionInput) => void;
  pendingImageSelection?: PendingImageSelection | null;
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

const wrapFieldContent = (content: ReactNode) => (
  <Box
    sx={{
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'flex-end',
      width: '100%',
    }}
    data-testid="form-field-wrapper"
  >
    {content}
  </Box>
);

const FormField = ({
  fields,
  derivationIndex,
  field,
  form,
  formValues,
  autocompleteOptions,
  mode,
  onAutocompleteCopy,
  onSelectPendingImage,
  pendingImageSelection,
}: FormFieldProps) => {
  const { key: fieldKey, type, readonly, required, label, fn, hideInEdit } = field;

  if (mode === 'edit' && hideInEdit) return null;

  switch (type) {
    case 'string':
    case 'number':
    case 'year':
      return (
        <form.Field
          key={fieldKey}
          name={fieldKey}
          validators={{ onChange: getFieldValidator(field) }}
        >
          {(fieldApi) => {
            const errorMessage = fieldApi.state.meta.isTouched
              ? fieldApi.state.meta.errors[0]
              : undefined;

            const isPendingDerivedField = Boolean(fn) && fieldApi.state.value === '';

            if (isPendingDerivedField) {
              return wrapFieldContent(renderPendingDerivedField(fieldKey));
            }

            return wrapFieldContent(
              <FormInput
                type={type === 'number' || type === 'year' ? 'number' : undefined}
                name={fieldKey}
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
                      ? rawValue === ''
                        ? ''
                        : Number(rawValue)
                      : rawValue;

                  fieldApi.handleChange(nextValue);

                  const derivedField = derivationIndex[fieldKey];
                  const derivedValue = getDerivedValue(derivedField, nextValue);
                  const nextFormValues = {
                    ...formValues,
                    [fieldKey]: nextValue,
                  };

                  if (derivedField?.fn?.target && derivedValue !== undefined) {
                    form.setFieldValue(derivedField.fn.target, derivedValue);
                    nextFormValues[derivedField.fn.target] = derivedValue;
                  }

                  if (type === 'string' && field.autocomplete) {
                    onAutocompleteCopy({
                      field,
                      values: nextFormValues,
                    });
                  }
                }}
                errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
                sx={{
                  width: '100%',
                  height: '67px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              />,
            );
          }}
        </form.Field>
      );
    case 'yearRange': {
      const rangeFieldKey: string = field.key;

      return (
        <form.Field
          key={rangeFieldKey}
          name={rangeFieldKey}
          validators={{ onChange: getFieldValidator(field) }}
        >
          {(fieldApi) => {
            const errorMessage = fieldApi.state.meta.isTouched
              ? fieldApi.state.meta.errors[0]
              : undefined;
            const { from, to } = parseYearRangeValue(fieldApi.state.value);
            const resolvedMax =
              field.max === 'todayYear'
                ? new Date().getFullYear()
                : typeof field.max === 'number'
                  ? field.max
                  : undefined;

            return wrapFieldContent(
              <Box sx={{ width: '100%' }}>
                <Typography sx={{ mb: 1 }} variant="body2">
                  {label}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  sx={{
                    width: '100%',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FormInput
                      type="number"
                      name={`${rangeFieldKey}-from`}
                      label="Tol"
                      required={required}
                      disabled={readonly}
                      value={from}
                      inputProps={{
                        min: field.min,
                        max: resolvedMax,
                        step: 1,
                      }}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => {
                        fieldApi.handleChange(
                          buildYearRangeValue({ from: event.target.value, to }),
                        );
                      }}
                      helperText=" "
                      sx={{ width: '100%', height: '67px' }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      pt: '42px',
                      flexShrink: 0,
                    }}
                    variant="h6"
                  >
                    -
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FormInput
                      type="number"
                      name={`${rangeFieldKey}-to`}
                      label="Ig"
                      required={required}
                      disabled={readonly}
                      value={to}
                      inputProps={{
                        min: field.min,
                        max: resolvedMax,
                        step: 1,
                      }}
                      onBlur={fieldApi.handleBlur}
                      onChange={(event) => {
                        fieldApi.handleChange(
                          buildYearRangeValue({ from, to: event.target.value }),
                        );
                      }}
                      errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
                      sx={{ width: '100%', height: '67px' }}
                    />
                  </Box>
                </Stack>
              </Box>,
            );
          }}
        </form.Field>
      );
    }
    case 'boolean':
      return (
        <form.Field
          key={fieldKey}
          name={fieldKey}
          validators={{ onChange: getFieldValidator(field) }}
        >
          {(fieldApi) => {
            const errorMessage = fieldApi.state.meta.isTouched
              ? fieldApi.state.meta.errors[0]
              : undefined;

            return wrapFieldContent(
              <Box
                sx={{ width: '100%', minHeight: '67px', display: 'grid', alignContent: 'center' }}
              >
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

                {typeof errorMessage === 'string' ? (
                  <Typography color="error" variant="caption">
                    {errorMessage}
                  </Typography>
                ) : null}
              </Box>,
            );
          }}
        </form.Field>
      );
    case 'select':
      return (
        <form.Field
          key={fieldKey}
          name={fieldKey}
          validators={{ onChange: getFieldValidator(field) }}
        >
          {(fieldApi) => {
            const errorMessage = fieldApi.state.meta.isTouched
              ? fieldApi.state.meta.errors[0]
              : undefined;

            const isPendingDerivedField = Boolean(field.fn) && fieldApi.state.value === '';

            if (isPendingDerivedField) {
              return wrapFieldContent(renderPendingDerivedField(fieldKey));
            }

            return wrapFieldContent(
              <FormSelect
                options={field.options}
                value={typeof fieldApi.state.value === 'string' ? fieldApi.state.value : ''}
                onChange={(nextValue) => {
                  fieldApi.handleChange(nextValue);

                  const derivedField = derivationIndex[fieldKey];
                  const derivedValue = getDerivedValue(derivedField, nextValue);

                  if (derivedField?.fn?.target && derivedValue !== undefined) {
                    form.setFieldValue(derivedField.fn.target, derivedValue);
                  }
                }}
                onBlur={fieldApi.handleBlur}
                disabled={readonly}
                name={fieldKey}
                label={label}
                required={required}
                errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
              />,
            );
          }}
        </form.Field>
      );
    case 'imageUpload':
      return (
        <form.Subscribe key={fieldKey} selector={(state) => state.values}>
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
              requiredFileNameFields.every(
                (requiredField) =>
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

            return wrapFieldContent(
              <ImageUploadField
                field={field}
                existingDesktopImageUrl={
                  typeof desktopImageValue === 'string' && desktopImageValue.trim().length > 0
                    ? desktopImageValue
                    : null
                }
                existingImageUrl={existingImageUrl}
                existingMobileImageUrl={
                  typeof mobileImageValue === 'string' && mobileImageValue.trim().length > 0
                    ? mobileImageValue
                    : null
                }
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
              />,
            );
          }}
        </form.Subscribe>
      );
    default:
      return wrapFieldContent(<Box key={fieldKey}>{label}</Box>);
  }
};

export default FormField;
