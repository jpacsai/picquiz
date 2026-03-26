import { Box, Typography } from '@mui/material';

import AppBreadcrumbs from '@/components/layout/Breadcrumbs/AppBreadcrumbs';

type PageLayoutProps = {
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
};

const PageLayout = ({ title, subTitle, children }: PageLayoutProps) => {
  return (
    <Box
      maxWidth="xl"
      sx={{ padding: '20px', display: 'flex', margin: 'auto', flexDirection: 'column' }}
    >
      <Box sx={{ marginBottom: '20px' }}>
        <AppBreadcrumbs />
      </Box>

      {(title || subTitle) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {title && <Typography variant="h1">{title}</Typography>}
          {subTitle && <Typography variant="h3">{subTitle}</Typography>}
        </Box>
      )}

      {children}
    </Box>
  );
};

export default PageLayout;
