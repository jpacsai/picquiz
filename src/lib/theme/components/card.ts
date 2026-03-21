import type { Components, Theme } from '@mui/material/styles';

const card: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      width: 'min-content',
      padding: '10px',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    }),
  },
};

export default card;
