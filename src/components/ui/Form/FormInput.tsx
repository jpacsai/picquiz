import { InputLabel, TextField } from '@mui/material';
import { useId, type ReactNode } from 'react';

type FormInputProps = Omit<
  React.ComponentProps<typeof TextField>,
  'error'
> & {
  errorMessage?: ReactNode;
};

const FormInput = ({
  id,
  label,
  placeholder,
  required,
  errorMessage,
  helperText,
  ...props
}: FormInputProps) => {
  const generatedId = useId();
  const finalId = id ?? `input-${generatedId}`;

  return (
    <>
      <InputLabel htmlFor={finalId}>{label}</InputLabel>
      <TextField
        id={finalId}
        error={!!errorMessage}
        helperText={errorMessage ?? helperText}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    </>
  );
};

export default FormInput;
