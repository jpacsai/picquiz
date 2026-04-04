import type { useMatches } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

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
      loaderData: {},
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
});
