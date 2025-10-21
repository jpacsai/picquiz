import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { Box } from '@mui/material';
import type { QueryClient } from '@tanstack/react-query';

const RootComponent = () => {
  return (
    <Box sx={{ minWidth: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Outlet />
    </Box>
  );
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});
