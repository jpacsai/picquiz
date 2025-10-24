import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import { RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from '@mui/material/styles';
import theme from './lib/theme/muiTheme.ts';
import { CssBaseline } from '@mui/material';
import { router } from './lib/router.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
