import { RouterLink } from '@components/ui/RouterLink';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { useMatches } from '@tanstack/react-router';

import type { FileRoutesByTo } from '@/routeTree.gen';

type BreadcrumbTo = keyof FileRoutesByTo;

type BreadcrumbItem =
  | {
      label: string;
      params?: never;
      to?: never;
    }
  | {
      label: string;
      params?: {
        topicId: string;
        itemId?: string;
      };
      to: BreadcrumbTo;
    };

type RouteLoaderData = {
  title?: string;
  topic?: {
    label: string;
  };
};

type RouteContext = {
  topicId?: string;
  topicLabel?: string;
};

const HOME_ITEM: BreadcrumbItem = { label: 'Kezdőlap', to: '/home' };
const ADMIN_ITEM: BreadcrumbItem = { label: 'Admin', to: '/admin' };

const getTopicLabel = (matches: ReturnType<typeof useMatches>) => {
  const matchWithTopic = [...matches].reverse().find((match) => {
    const loaderData = match.loaderData as RouteLoaderData | undefined;

    return typeof loaderData?.topic?.label === 'string' && loaderData.topic.label.trim().length > 0;
  });

  return (matchWithTopic?.loaderData as RouteLoaderData | undefined)?.topic?.label;
};

const getAdminTopicItem = ({ topicId, topicLabel }: RouteContext): BreadcrumbItem | null => {
  if (!topicId || !topicLabel) {
    return null;
  }

  return { label: topicLabel, params: { topicId }, to: '/admin/$topicId' };
};

const getAdminItems = (context: RouteContext, currentLabel?: string): BreadcrumbItem[] => {
  const topicItem = getAdminTopicItem(context);

  if (!topicItem) {
    return [{ label: 'Admin' }];
  }

  return currentLabel
    ? [ADMIN_ITEM, topicItem, { label: currentLabel }]
    : [ADMIN_ITEM, { label: topicItem.label }];
};

const getTopicItems = ({ topicLabel }: RouteContext, currentLabel?: string): BreadcrumbItem[] => {
  if (!topicLabel) {
    return [HOME_ITEM];
  }

  return currentLabel
    ? [HOME_ITEM, { label: topicLabel }, { label: currentLabel }]
    : [HOME_ITEM, { label: topicLabel }];
};

const getItems = (matches: ReturnType<typeof useMatches>): BreadcrumbItem[] => {
  const currentMatch = matches.at(-1);

  if (!currentMatch) {
    return [];
  }

  const routeId = currentMatch.routeId;
  const topicId =
    typeof currentMatch.params.topicId === 'string' ? currentMatch.params.topicId : undefined;
  const topicLabel = getTopicLabel(matches);
  const context = { topicId, topicLabel };

  switch (routeId) {
    case '/_app/home':
      return [{ label: 'Kezdőlap' }];
    case '/_app/admin/':
      return [{ label: 'Admin' }];
    case '/_app/admin/$topicId/':
      return getAdminItems(context);
    case '/_app/admin/$topicId/new':
      return getAdminItems(context, 'Új elem');
    case '/_app/admin/$topicId/$itemId/edit':
      return getAdminItems(context, 'Szerkesztés');
    case '/_app/admin/$topicId/success':
      return getAdminItems(context, 'Sikeres mentés');
    case '/_app/$topicId/':
      return getTopicItems(context);
    case '/_app/quiz/':
      return [HOME_ITEM, { label: 'Kvíz' }];
    default:
      return [];
  }
};

const AppBreadcrumbs = () => {
  const matches = useMatches();
  const items = getItems(matches);

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
