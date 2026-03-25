import type { Components, Theme } from '@mui/material/styles';

const inputBase: Components<Theme>['MuiInputBase'] = {
  styleOverrides: {
    root: () => ({
      boxSizing: 'border-box',
      minHeight: '67px',
      "& .MuiInputBase-input": {
        boxSizing: 'border-box',
        height: 'auto',
        paddingBottom: 0,
        paddingTop: 0,
      },
      '&.MuiInputBase-multiline': {
        height: 'auto',
        minHeight: 'auto',
      },
      '&.MuiInputBase-multiline .MuiInputBase-input': {
        height: 'auto',
        paddingBottom: 'initial',
        paddingTop: 'initial',
      },
    }),
  },
};

export default inputBase;
