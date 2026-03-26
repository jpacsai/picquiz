import type { BreadcrumbItem } from '@/types/breadcrumbs';

export const HOME_BREADCRUMB_ITEM: BreadcrumbItem = { label: 'Kezdőlap', to: '/home' };
export const ADMIN_BREADCRUMB_ITEM: BreadcrumbItem = { label: 'Admin', to: '/admin' };
export const ADMIN_SCHEMAS_BREADCRUMB_ITEM: BreadcrumbItem = {
  label: 'Sémák',
  to: '/admin/schemas',
};
