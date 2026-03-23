import { Autocomplete, Box, InputLabel, TextField } from '@mui/material';
import { type ChangeEvent, type ReactNode, useId } from 'react';

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
  onBlur,
  onChange,
  options,
  value,
  ...props
}: FormInputProps) => {
  const generatedId = useId();
  const finalId = id ?? `input-${generatedId}`;
  const hasAutocompleteOptions = Boolean(options?.length);

  const handleValueChange = (nextValue: string) => {
    onChange?.({
      target: {
        value: nextValue,
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <InputLabel htmlFor={finalId} required={required}>
        {label}
      </InputLabel>
      {hasAutocompleteOptions ? (
        <Autocomplete
          freeSolo
          options={options ?? []}
          value={typeof value === 'string' ? value : ''}
          onChange={(_, nextValue) => {
            handleValueChange(nextValue ?? '');
          }}
          onInputChange={(_, nextValue, reason) => {
            if (reason === 'input' || reason === 'clear') {
              handleValueChange(nextValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              id={finalId}
              name={name}
              required={required}
              placeholder={placeholder}
              error={!!errorMessage}
              helperText={errorMessage ?? helperText}
              onBlur={onBlur}
              inputProps={{
                ...params.inputProps,
                ...inputProps,
                'data-testid': name ? `form-input-${String(name)}` : inputProps?.['data-testid'],
              }}
            />
          )}
        />
      ) : (
        <TextField
          id={finalId}
          error={!!errorMessage}
          helperText={errorMessage ?? helperText}
          onBlur={onBlur}
          onChange={onChange}
          inputProps={{
            ...inputProps,
            'data-testid': name ? `form-input-${String(name)}` : inputProps?.['data-testid'],
          }}
          placeholder={placeholder}
          required={required}
          name={name}
          value={value}
          {...props}
        />
      )}
    </Box>
  );
};

export default FormInput;
