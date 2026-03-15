import { Box, InputLabel, MenuItem, TextField } from '@mui/material';
import { type ReactNode,useId } from 'react';

type FormInputProps = Omit<React.ComponentProps<typeof TextField>, 'error'> & {
  errorMessage?: ReactNode;
  options?: string[];
};

const FormInput = ({
  id,
  label,
  name,
  placeholder,
  required,
  errorMessage,
  helperText,
  inputProps,
  options,
  ...props
}: FormInputProps) => {
  const generatedId = useId();
  const finalId = id ?? `input-${generatedId}`;
  const isSelect = Boolean(options?.length);

  return (
    <Box sx={{ width: '100%' }}>
      <InputLabel htmlFor={finalId} required={required}>
        {label}
      </InputLabel>
      <TextField
        id={finalId}
        error={!!errorMessage}
        helperText={errorMessage ?? helperText}
        inputProps={{
          ...inputProps,
          'data-testid': name ? `form-input-${String(name)}` : inputProps?.['data-testid'],
        }}
        placeholder={placeholder}
        required={required}
        select={isSelect}
        name={name}
        {...props}
      >
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default FormInput;
