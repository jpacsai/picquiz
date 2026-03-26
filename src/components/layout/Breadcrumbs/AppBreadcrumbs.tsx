import { RouterLink } from '@components/ui/RouterLink';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';

import useAppBreadcrumbs from './useAppBreadcrumbs';

const AppBreadcrumbs = () => {
  const items = useAppBreadcrumbs();

  if (!items.length || items.length === 1) {
    return null;
  }

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator="›"
      sx={(theme) => ({
        color: theme.customTokens.onSurface.pageSecondary,
        '& .MuiBreadcrumbs-separator': {
          color: theme.customTokens.onSurface.pageSecondary,
        },
      })}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.to) {
          return (
            <Typography key={`${item.label}-${index}`} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          );
        }

        return (
          <RouterLink
            key={`${item.label}-${index}`}
            params={item.params}
            sx={(theme) => ({
              color: theme.customTokens.onSurface.pageSecondary,
              transition: 'color 150ms ease',
              '&:hover': {
                color: theme.customTokens.onSurface.pagePrimary,
              },
            })}
            to={item.to}
            underline="hover"
            variant="body2"
          >
            {item.label}
          </RouterLink>
        );
      })}
    </Breadcrumbs>
  );
};

export default AppBreadcrumbs;
