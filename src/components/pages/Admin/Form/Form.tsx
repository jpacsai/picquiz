import type { TopicField } from '../../../../types/topics';
import { useForm } from '@tanstack/react-form';
import { Box } from '@mui/material';
import FormInput from '../../../ui/Form/FormInput';
import { getDefaultValues, getDerivationIndex, getDerivedValue, getFieldValidator } from './utils';

type FieldsProps = {
  fields: TopicField[];
};

const Fields = ({ fields }: FieldsProps) => {
  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);

  const renderField = (field: TopicField) => {
    const { key, type, readonly, required, label } = field;
    switch (field.type) {
      case 'string':
      case 'number':
        return (
          <form.Field
            key={key}
            name={key}
            validators={{ onChange: getFieldValidator(field) }}
          >
            {(fieldApi) => {
              const errorMessage = fieldApi.state.meta.isTouched
                ? fieldApi.state.meta.errors[0]
                : undefined;

              return (
                <FormInput
                  type={type}
                  name={key}
                  label={label}
                  required={required}
                  disabled={readonly}
                  value={fieldApi.state.value}
                  onBlur={fieldApi.handleBlur}
                  onChange={(event) => {
                    const rawValue = event.target.value;
                    const nextValue = type === 'number' ? (rawValue === '' ? '' : Number(rawValue)) : rawValue;

                    fieldApi.handleChange(nextValue);

                    const derivedField = derivationIndex[key];
                    const derivedValue = getDerivedValue(derivedField, nextValue);

                    if (derivedField?.fn?.target && derivedValue !== undefined) {
                      form.setFieldValue(derivedField.fn.target, derivedValue);
                    }
                  }}
                  errorMessage={typeof errorMessage === 'string' ? errorMessage : undefined}
                />
              );
            }}
          </form.Field>
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
      {fields.map((field) => renderField(field))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default Fields;
