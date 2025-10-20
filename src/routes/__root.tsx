import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'

const RootComponent = () => {
  return (
    <Box sx={{ minWidth: "100vw", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <Outlet />
    </Box>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})


