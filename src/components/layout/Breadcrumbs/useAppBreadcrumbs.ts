import { useMatches } from '@tanstack/react-router';

import { getItems } from '@/components/layout/Breadcrumbs/utils';
import type { BreadcrumbItem } from '@/types/breadcrumbs';


const useAppBreadcrumbs = (): BreadcrumbItem[] => {
  const matches = useMatches();

  return getItems(matches);
};

export default useAppBreadcrumbs;
