import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ErrorComponentProps } from '@tanstack/react-router';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

const HOME_PATH = '/home';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Ismeretlen hiba történt.';
};

type ErrorFallbackContentProps = {
  error?: unknown;
};

const ErrorFallbackContent = ({ error }: ErrorFallbackContentProps) => {
  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        inset: 0,
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        zIndex: theme.zIndex.modal + 1,
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      })}
    >
      <Paper
        elevation={3}
        sx={(theme) => ({
          width: '100%',
          maxWidth: 560,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: `1px solid ${theme.customTokens.border.main}`,
          boxShadow: 'none',
          textAlign: 'center',
        })}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gap: 1.5, justifyItems: 'center' }}>
            <Typography
              sx={(theme) => ({
                color: theme.palette.primary.main,
              })}
              variant="overline"
            >
              QuizPic
            </Typography>
            <Typography variant="h4">Valami nem a terv szerint alakult</Typography>
            <Typography color="text.secondary" variant="body1">
              Kérlek, frissítsd az oldalt, vagy térj vissza a főoldalra.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: 2,
              bgcolor: theme.palette.background.default,
              borderColor: theme.customTokens.border.main,
            })}
          >
            <Typography color="text.secondary" sx={{ wordBreak: 'break-word' }} variant="body2">
              {getErrorMessage(error)}
            </Typography>
          </Paper>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <Button
              variant="contained"
              onClick={() => {
                window.location.reload();
              }}
            >
              Frissítés
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                window.location.assign(HOME_PATH);
              }}
            >
              Vissza a főoldalra
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: unknown;
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackContent error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const RouterErrorFallback = ({ error }: ErrorComponentProps) => {
  return <ErrorFallbackContent error={error} />;
};

export default ErrorBoundary;
