import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import { NavLink } from '@/components/ui/NavLink';
import StyleSelector from '@/components/ui/StyleSelector';

const NavBar = () => {
  return (
    <AppBar
      position="static"
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.customTokens.onSurface.cardPrimary,
        borderBottom: `1px solid ${theme.customTokens.border.main}`,
        boxShadow: 'none',
      })}
    >
      <Toolbar disableGutters>
        <Box
          maxWidth="xl"
          sx={{
            padding: '10px 20px',
            display: 'flex',
            margin: 'auto',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <NavLink
            to="/home"
            activeOptions={{ exact: true }}
            underline="none"
            preload="intent"
            sx={{ padding: 0 }}
          >
            <Typography
              variant="h2"
              sx={(theme) => ({
                color: theme.palette.primary.main,
                marginRight: { xs: '10px', sm: '60px' },
                transition: 'color 150ms ease',
                backgroundColor: 'transparent',
                '&:hover': {
                  color: theme.customTokens.brand.primaryHover,
                },
              })}
            >
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
