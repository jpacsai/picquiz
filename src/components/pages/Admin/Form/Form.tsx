import { Box, Button } from '@mui/material';
import { useForm } from '@tanstack/react-form';

import type { TopicField } from '../../../../types/topics';
import FormField from './FormField';
import { getDefaultValues, getDerivationIndex } from './utils';

type FormProps = {
  fields: TopicField[];
  storagePrefix: string;
};

const Form = ({ fields, storagePrefix }: FormProps) => {
  const defaultValues = getDefaultValues(fields);
  const derivationIndex = getDerivationIndex(fields);

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
        {fields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            form={form}
            storagePrefix={storagePrefix}
            derivationIndex={derivationIndex}
          />
        ))}
      </Box>

      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
};

export default Form;
