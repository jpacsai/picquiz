import type { useMatches } from '@tanstack/react-router';

import { HOME_BREADCRUMB_ITEM } from '@/consts/breadcrumbs';
import type {
  BreadcrumbItem,
  BreadcrumbRouteContext,
  BreadcrumbRouteLoaderData,
} from '@/types/breadcrumbs';

const getTopicLabel = (matches: ReturnType<typeof useMatches>) => {
  const matchWithTopic = [...matches].reverse().find((match) => {
    const loaderData = match.loaderData as BreadcrumbRouteLoaderData | undefined;

    return typeof loaderData?.topic?.label === 'string' && loaderData.topic.label.trim().length > 0;
  });

  return (matchWithTopic?.loaderData as BreadcrumbRouteLoaderData | undefined)?.topic?.label;
};

const getAdminSchemasItems = (
  context: BreadcrumbRouteContext,
  currentLabel?: string,
  includeTopicLabel = false,
): BreadcrumbItem[] => {
  if (!includeTopicLabel || !context.topicId || !context.topicLabel) {
    return currentLabel
      ? [HOME_BREADCRUMB_ITEM, { label: currentLabel }]
      : [HOME_BREADCRUMB_ITEM];
  }

  return currentLabel
    ? [HOME_BREADCRUMB_ITEM, { label: context.topicLabel }, { label: currentLabel }]
    : [HOME_BREADCRUMB_ITEM, { label: context.topicLabel }];
};

const getTopicItem = ({ topicId, topicLabel }: BreadcrumbRouteContext): BreadcrumbItem | null => {
  if (!topicId || !topicLabel) {
    return null;
  }

  return { label: topicLabel, params: { topicId }, to: '/$topicId' };
};

const getTopicItems = (context: BreadcrumbRouteContext, currentLabel?: string): BreadcrumbItem[] => {
  const topicItem = getTopicItem(context);

  if (!topicItem) {
    return [HOME_BREADCRUMB_ITEM];
  }

  if (!currentLabel) {
    return [HOME_BREADCRUMB_ITEM, { label: topicItem.label }];
  }

  return [HOME_BREADCRUMB_ITEM, topicItem, { label: currentLabel }];
};

export const getItems = (matches: ReturnType<typeof useMatches>): BreadcrumbItem[] => {
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
    case '/_app/admin/schemas/':
      return [HOME_BREADCRUMB_ITEM, { label: 'Új séma' }];
    case '/_app/admin/schemas/new':
      return getAdminSchemasItems(context, 'Új séma');
    case '/_app/admin/schemas/$topicId/duplicate':
      return getAdminSchemasItems(context, 'Duplikálás', true);
    case '/_app/$topicId/':
      return getTopicItems(context);
    case '/_app/$topicId/schema':
      return getTopicItems(context, 'Séma szerkesztése');
    case '/_app/$topicId/items/':
      return getTopicItems(context, 'Itemek');
    case '/_app/$topicId/items/new':
      return getTopicItems(context, 'Új elem');
    case '/_app/$topicId/items/$itemId/edit':
      return getTopicItems(context, 'Szerkesztés');
    case '/_app/$topicId/items/success':
      return getTopicItems(context, 'Sikeres mentés');
    case '/_app/$topicId/quiz-config':
      return getTopicItems(context);
    case '/_app/$topicId/quiz':
      return getTopicItems(context, 'Kvíz');
    case '/_app/quiz/':
      return [HOME_BREADCRUMB_ITEM, { label: 'Kvíz' }];
    default:
      return [];
  }
};
