import { blue } from '@mui/material/colors';
import type { Components, Theme } from '@mui/material/styles';

const card: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: () => ({
      width: 'min-content',
      padding: '20px',
      backgroundColor: blue.A100,
      color: 'black',
    }),
  },
};

export default card;
