import type { Components, Theme } from '@mui/material/styles';

const inputLabel: Components<Theme>['MuiInputLabel'] = {
  styleOverrides: {
    root: () => ({
      minHeight: '22px',
      '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
        transform: 'translate(14px, 22px) scale(1)',
      },
      '&.MuiInputLabel-outlined.MuiInputLabel-sizeSmall:not(.MuiInputLabel-shrink)': {
        transform: 'translate(14px, 21px) scale(1)',
      },
    }),
  },
};

export default inputLabel;
