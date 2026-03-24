import type { Components, Theme } from '@mui/material/styles';

const inputBase: Components<Theme>['MuiInputBase'] = {
  styleOverrides: {
    root: () => ({
      "& .MuiInputBase-input": {
        height: '55px',
        boxSizing: 'inherit',
      },
      '&.MuiInputBase-multiline': {
        height: 'auto',
      },
      '&.MuiInputBase-multiline .MuiInputBase-input': {
        height: 'auto',
      },
    }),
  },
};

export default inputBase;
