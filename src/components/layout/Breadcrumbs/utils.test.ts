import type { useMatches } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import { router } from '@/lib/router';

import { getItems } from './utils';

const createMatches = (
  topicLabel = 'Művészet',
): ReturnType<typeof useMatches> =>
  [
    {
      loaderData: {
        topic: {
          label: topicLabel,
        },
      },
      params: {
        topicId: 'art',
      },
      routeId: '/_app/$topicId/',
      search: {},
    },
    {
      loaderData: {
        item: {
          name: 'art-item-1',
        },
      },
      params: {
        itemId: 'item-1',
        topicId: 'art',
      },
      routeId: '/_app/$topicId/items/$itemId/edit',
      search: {},
    },
  ] as ReturnType<typeof useMatches>;

describe('getItems', () => {
  it('includes the items breadcrumb before the item edit page', () => {
    expect(getItems(createMatches())).toEqual([
      { label: 'Kezdőlap', to: '/home' },
      { label: 'Művészet', params: { topicId: 'art' }, to: '/$topicId' },
      { label: 'Elemek', params: { topicId: 'art' }, to: '/$topicId/items' },
      { label: 'art-item-1' },
      { label: 'Szerkesztés' },
    ]);
  });

  it('falls back to a non-link items breadcrumb when the topic context is missing', () => {
    const matches = [
      {
        loaderData: {},
        params: {},
        routeId: '/_app/$topicId/items/$itemId/edit',
        search: {},
      },
    ] as ReturnType<typeof useMatches>;

    expect(getItems(matches)).toEqual([
      { label: 'Kezdőlap', to: '/home' },
      { label: 'Elemek' },
      { label: 'Szerkesztés' },
    ]);
  });

  it('keeps breadcrumb item counts aligned with the route path depth for every breadcrumb route', () => {
    const breadcrumbRoutes = Object.values(router.routesById)
      .filter(
        (
          route,
        ): route is {
          fullPath: string;
          id: string;
        } => route.id.startsWith('/_app/') && typeof route.fullPath === 'string',
      )
      .filter((route) => getItems(createRouteMatches(route)).length > 0);

    expect(breadcrumbRoutes.length).toBeGreaterThan(0);

    breadcrumbRoutes.forEach((route) => {
      expect(getItems(createRouteMatches(route))).toHaveLength(
        getExpectedBreadcrumbCount(route.fullPath),
      );
    });
  });
});

const createRouteMatches = ({
  fullPath,
  id,
}: {
  fullPath: string;
  id: string;
}): ReturnType<typeof useMatches> => {
  const params = {
    ...(fullPath.includes('$itemId') ? { itemId: 'item-1' } : {}),
    ...(fullPath.includes('$topicId') ? { topicId: 'art' } : {}),
  };

  const loaderData = fullPath.includes('$topicId')
    ? {
        ...(fullPath.includes('$itemId')
          ? {
              item: {
                name: 'art-item-1',
              },
            }
          : {}),
        topic: {
          label: 'Művészet',
        },
      }
    : fullPath.includes('$itemId')
      ? {
          item: {
            name: 'art-item-1',
          },
        }
      : {};

  return [
    {
      loaderData,
      params,
      routeId: id,
      search: {},
    },
  ] as ReturnType<typeof useMatches>;
};

const getPathSegmentCount = (fullPath: string): number => fullPath.split('/').filter(Boolean).length;

const getExpectedBreadcrumbCount = (fullPath: string): number => {
  const pathSegmentCount = getPathSegmentCount(fullPath);

  return fullPath === '/home' ? pathSegmentCount : pathSegmentCount + 1;
};
