import Box from '@mui/material/Box';
import type { ComponentType, Key, ReactNode } from 'react';

import type { TopicField } from '../../../../types/topics';
import FormInput from '../../../ui/Form/FormInput';
import ImageUploadField from '../../../ui/Form/ImageUploadField';
import FormSelect from '../../../ui/Form/FormSelect';
import { getDerivedValue, getFieldValidator, type FormValues, type FormDeriveField } from './utils';

type FormFieldProps = {
  derivationIndex: Record<string, FormDeriveField>;
  field: TopicField;
  form: {
    Field: ComponentType<{
      children: (fieldApi: any) => ReactNode;
      key?: Key;
      name: string;
      validators?: {
        onChange?: (props: { value: string | number }) => string | undefined;
      };
    }>;
    Subscribe: ComponentType<{
      children: (values: FormValues) => ReactNode;
      key?: Key;
      selector: (state: { values: FormValues }) => FormValues;
    }>;
    setFieldValue: (field: string, value: string | number) => void;
  };
  storagePrefix: string;
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

const FormField = ({ derivationIndex, field, form, storagePrefix }: FormFieldProps) => {
  const { key, type, readonly, required, label, fn, hideInEdit } = field;

  if (hideInEdit) return null;

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
        <form.Subscribe key={key} selector={(state) => state.values as FormValues}>
          {(values) => {
            const artistValue = values[field.fileNameFields.artist];
            const titleValue = values[field.fileNameFields.title];

            return (
              <ImageUploadField
                field={field}
                artistName={typeof artistValue === 'string' ? artistValue : ''}
                title={typeof titleValue === 'string' ? titleValue : ''}
                storagePrefix={storagePrefix}
                onUploaded={(urls) => {
                  form.setFieldValue(field.targetFields.desktop, urls.desktop);
                  form.setFieldValue(field.targetFields.mobile, urls.mobile);
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
