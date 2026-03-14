import { Box, Button } from '@mui/material';
import { useForm } from '@tanstack/react-form';

import type { TopicField } from '../../../../types/topics';
import FormInput from '../../../ui/Form/FormInput';
import ImageUploadField from '../../../ui/Form/ImageUploadField';
import FormSelect from '../../../ui/Form/FormSelect';
import { getDefaultValues, getDerivationIndex, getDerivedValue, getFieldValidator } from './utils';

type FieldsProps = {
  fields: TopicField[];
  storagePrefix: string;
};

const Fields = ({ fields, storagePrefix }: FieldsProps) => {
  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);

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
    </form>
  );
};

export default Fields;
