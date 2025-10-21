import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';
import { queryClient } from './queryClient';

export const router = createRouter({
  routeTree,
  context: { queryClient },
});
