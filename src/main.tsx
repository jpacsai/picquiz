import './index.css';

import { CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { SnackbarProvider } from 'notistack';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ErrorBoundary from './components/ui/ErrorBoundary/ErrorBoundary.tsx';
import { queryClient } from './lib/queryClient.ts';
import { router } from './lib/router.ts';
import { ThemePresetProvider } from './lib/theme/ThemePresetProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemePresetProvider>
          <CssBaseline />
          <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            autoHideDuration={4000}
            maxSnack={3}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </ThemePresetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
