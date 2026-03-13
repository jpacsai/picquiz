import { InputLabel, MenuItem, TextField } from '@mui/material';
import { useId, type ReactNode } from 'react';

type FormInputProps = Omit<
  React.ComponentProps<typeof TextField>,
  'error'
> & {
  errorMessage?: ReactNode;
  options?: string[];
};

const FormInput = ({
  id,
  label,
  placeholder,
  required,
  errorMessage,
  helperText,
  options,
  ...props
}: FormInputProps) => {
  const generatedId = useId();
  const finalId = id ?? `input-${generatedId}`;
  const isSelect = Boolean(options?.length);

  return (
    <>
      <InputLabel htmlFor={finalId}>{label}</InputLabel>
      <TextField
        id={finalId}
        error={!!errorMessage}
        helperText={errorMessage ?? helperText}
        placeholder={placeholder}
        required={required}
        select={isSelect}
        {...props}
      >
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default FormInput;
