import { createRouter } from '@tanstack/react-router';

import { RouterErrorFallback } from '@/components/ui/ErrorBoundary/ErrorBoundary';

import { routeTree } from '../routeTree.gen';
import { queryClient } from './queryClient';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: RouterErrorFallback,
});
