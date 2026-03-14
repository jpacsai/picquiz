import type { Components, Theme } from '@mui/material/styles';

const inputLabel: Components<Theme>['MuiInputLabel'] = {
  styleOverrides: {
    root: () => ({
      minHeight: '22px'
    }),
  },
};

export default inputLabel;
