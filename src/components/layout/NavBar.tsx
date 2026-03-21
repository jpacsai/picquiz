import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import { NavLink } from '@/components/ui/NavLink';
import StyleSelector from '@/components/ui/StyleSelector';

const NavBar = () => {
  return (
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
            <Typography variant="h2" sx={{ color: 'primary.main', marginRight: '60px' }}>
              QuizPic
            </Typography>
          </NavLink>

          <NavLink to="/admin" activeOptions={{ exact: true }} underline="none" preload="intent">
            Admin
          </NavLink>

          <Box sx={{ marginLeft: 'auto' }}>
            <StyleSelector />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
