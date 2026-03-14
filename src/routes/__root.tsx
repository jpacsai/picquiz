import { Box } from '@mui/material';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext,Outlet } from '@tanstack/react-router';

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
