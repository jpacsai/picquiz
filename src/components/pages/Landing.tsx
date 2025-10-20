import { AppBar, Box, Toolbar } from "@mui/material"
import { Link } from "@tanstack/react-router";

const Landing = () => {
  return <Box sx={{ width: "100%" }}>
    <AppBar position="static">
      <Toolbar>
        <Link
          to="/login"
          search={{ from: '/home' }}
        >
          Sign in
        </Link>
      </Toolbar>
    </AppBar>
  </Box>
}

export default Landing;