import { Autocomplete, Box, InputLabel, TextField } from '@mui/material';
import { useId } from 'react';

type FormSelectProps = {
  id?: string;
  disabled?: boolean;
  errorMessage?: string;
  label: string;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  value: string;
};

const FormSelect = ({
  id,
  disabled,
  errorMessage,
  label,
  name,
  onBlur,
  onChange,
  options,
  required,
  value,
}: FormSelectProps) => {
  const generatedId = useId();
  const finalId = id ?? `autocomplete-${generatedId}`;

  return (
    <Box sx={{ width: '100%' }}>
      <InputLabel htmlFor={finalId} required={required}>
        {label}
      </InputLabel>
      <Autocomplete
        options={options}
        value={value}
        onChange={(_, nextValue) => {
          onChange(nextValue ?? '');
        }}
        onBlur={onBlur}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            required={required}
            error={Boolean(errorMessage)}
            helperText={errorMessage}
          />
        )}
      />
    </Box>
  );
};

export default FormSelect;
