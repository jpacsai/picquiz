import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useRouter, useSearch } from '@tanstack/react-router';
import { authStore } from '../../auth/authStore';

const Login = () => {
  const router = useRouter();
  const { from } = useSearch({ from: '/login' });

  const onSignIn = () => authStore.signIn().then(() => router.navigate({ to: from ?? '/_app' }));

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'teal',
        width: 'fit-content',
        height: 'fit-content',
        alignSelf: 'center',
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ textAlign: 'center' }}>
          Bejelentkezés
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={onSignIn}>
          Sign in with Google
        </Button>
      </CardActions>
    </Card>
  );
};

export default Login;
