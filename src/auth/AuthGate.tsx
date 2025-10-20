import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from './useAuth';
import { authStore } from './authStore';
import type { ReactNode } from 'react';

type AuthGateProps = { children: ReactNode };

const AuthGate = ({ children }: AuthGateProps) => {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <Box
        sx={{
          padding: '24px',
          display: 'grid',
          gap: '16px',
          alignContent: 'center',
          justifyItems: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="body2">Checking sign-in…</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          padding: '24px',
          display: 'grid',
          gap: '16px',
          justifyItems: 'start',
        }}
      >
        <Typography variant="h6">Private quiz</Typography>
        <Button variant="contained" onClick={authStore.signIn}>
          Sign in with Google
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          padding: '16px 8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">Signed in as {user.email}</Typography>
        <Button size="small" variant="text" onClick={authStore.signOut}>
          Sign out
        </Button>
      </Box>
      {children}
    </>
  );
};

export default AuthGate;
