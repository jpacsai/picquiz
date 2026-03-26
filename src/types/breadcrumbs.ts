import type { FileRoutesByTo } from '@/routeTree.gen';

type BreadcrumbTo = keyof FileRoutesByTo;

export type BreadcrumbItem =
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

export type BreadcrumbRouteLoaderData = {
  title?: string;
  topic?: {
    label: string;
  };
};

export type BreadcrumbRouteContext = {
  topicId?: string;
  topicLabel?: string;
};
