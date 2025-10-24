import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { NavLink } from '../ui/NavLink';
import { blue } from '@mui/material/colors';
import usePageMeta from '../../utils/usePageMeta';

const AppLayout = () => {
  const { title, subTitle } = usePageMeta();

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static">
        <Toolbar disableGutters>
          <Box
            maxWidth="xl"
            sx={{
              padding: '20px',
              display: 'flex',
              margin: 'auto',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <NavLink to="/home" activeOptions={{ exact: true }} underline="none" preload="intent">
              <Typography variant="h2" sx={{ color: blue.A700, marginRight: '60px' }}>
                QuizPic
              </Typography>
            </NavLink>

            <NavLink to="/admin" activeOptions={{ exact: true }} underline="none" preload="intent">
              Admin
            </NavLink>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        maxWidth="xl"
        sx={{ padding: '20px', display: 'flex', margin: 'auto', flexDirection: 'column' }}
      >
        {(title || subTitle) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {title && <Typography variant="h1">{title}</Typography>}
            {subTitle && <Typography variant="h3">{subTitle}</Typography>}
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
