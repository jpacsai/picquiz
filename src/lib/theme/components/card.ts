import type { Components, Theme } from '@mui/material/styles';

const card: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      width: '100%',
      padding: '10px',
      backgroundColor: theme.palette.background.paper,
      color: theme.customTokens.onSurface.cardPrimary,
      '& .MuiTypography-colorTextPrimary': {
        color: theme.customTokens.onSurface.cardPrimary,
      },
      '& .MuiTypography-colorTextSecondary': {
        color: theme.customTokens.onSurface.cardSecondary,
      },
    }),
  },
};

export default card;
