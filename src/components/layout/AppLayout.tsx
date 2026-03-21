import { Box } from '@mui/material';
import { Outlet } from '@tanstack/react-router';

import NavBar from '@/components/layout/NavBar';
import PageLayout from '@/components/ui/layout/AppLayout';

import usePageMeta from '../../utils/usePageMeta';

const AppLayout = () => {
  const { title, subTitle } = usePageMeta();

  return (
    <Box sx={{ width: '100%' }}>
      <NavBar />

      <PageLayout title={title} subTitle={subTitle}>
        <Outlet />
      </PageLayout>
    </Box>
  );
};

export default AppLayout;
