import type { Components, Theme } from '@mui/material/styles';

const inputBase: Components<Theme>['MuiInputBase'] = {
  styleOverrides: {
    root: () => ({
        height: '55px',

      "& .MuiInputBase-input": {
        height: '55px',
        boxSizing: 'inherit'
      },
    }),
  },
};

export default inputBase;
