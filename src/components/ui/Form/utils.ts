import type { ReactNode } from 'react';

export const getFormFieldHelperText = (
  errorMessage?: ReactNode,
  helperText?: ReactNode,
): ReactNode =>
  errorMessage === 'Required' ? undefined : errorMessage ?? helperText;
