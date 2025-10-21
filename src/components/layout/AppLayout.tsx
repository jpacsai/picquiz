import { AppBar, Box, Toolbar } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { RouterLink } from '../ui/RouterLink';

const AppLayout = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <RouterLink
            to="/home"
            activeOptions={{ exact: true }}
            underline="none"
            preload="intent"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: 'text.primary',
              '&[data-status="active"]': {
                fontWeight: 700,
                bgcolor: 'action.selected',
              },
            }}
          >
            Home
          </RouterLink>

          <RouterLink
            to="/quiz"
            activeOptions={{ exact: true }}
            underline="none"
            preload="intent"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: 'text.primary',
              '&[data-status="active"]': {
                fontWeight: 700,
                bgcolor: 'action.selected',
              },
            }}
          >
            Quiz
          </RouterLink>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  );
};

export default AppLayout;
